/* eslint no-magic-numbers: 0 */
const languageCodeRe = "([a-z]{2,3}|\\*)";
const scriptCodeRe = "(?:-([a-z]{4}|\\*))";
const regionCodeRe = "(?:-([a-z]{2}|[0-9]{1,3}|\\*))";
const variantCodeRe = "(?:-(([0-9][a-z0-9]{3}|[a-z0-9]{5,8})|\\*))";
/**
 * Regular expression splitting locale id into four pieces:
 *
 * Example: `en-Latn-US-macos`
 *
 * language: en
 * script:   Latn
 * region:   US
 * variant:  macos
 *
 * It can also accept a range `*` character on any position.
 */
const localeRe = new RegExp(`^${languageCodeRe}${scriptCodeRe}?${regionCodeRe}?${variantCodeRe}?$`, "i");
export class Locale {
    /**
     * Parses a locale id using the localeRe into an array with four elements.
     *
     * If the second argument `range` is set to true, it places range `*` char
     * in place of any missing piece.
     *
     * It also allows skipping the script section of the id, so `en-US` is
     * properly parsed as `en-*-US-*`.
     */
    constructor(locale) {
        const result = localeRe.exec(locale.replace(/_/g, "-"));
        if (!result) {
            this.isWellFormed = false;
            return;
        }
        let [, language, script, region, variant] = result;
        if (language) {
            this.language = language.toLowerCase();
        }
        if (script) {
            this.script = script[0].toUpperCase() + script.slice(1);
        }
        if (region) {
            this.region = region.toUpperCase();
        }
        this.variant = variant;
        this.isWellFormed = true;
    }
    isEqual(other) {
        return (this.language === other.language &&
            this.script === other.script &&
            this.region === other.region &&
            this.variant === other.variant);
    }
    matches(other, thisRange = false, otherRange = false) {
        return ((this.language === other.language ||
            (thisRange && this.language === undefined) ||
            (otherRange && other.language === undefined)) &&
            (this.script === other.script ||
                (thisRange && this.script === undefined) ||
                (otherRange && other.script === undefined)) &&
            (this.region === other.region ||
                (thisRange && this.region === undefined) ||
                (otherRange && other.region === undefined)) &&
            (this.variant === other.variant ||
                (thisRange && this.variant === undefined) ||
                (otherRange && other.variant === undefined)));
    }
    toString() {
        return [this.language, this.script, this.region, this.variant]
            .filter(part => part !== undefined)
            .join("-");
    }
    clearVariants() {
        this.variant = undefined;
    }
    clearRegion() {
        this.region = undefined;
    }
    addLikelySubtags() {
        const newLocale = getLikelySubtagsMin(this.toString().toLowerCase());
        if (newLocale) {
            this.language = newLocale.language;
            this.script = newLocale.script;
            this.region = newLocale.region;
            this.variant = newLocale.variant;
            return true;
        }
        return false;
    }
}
/**
 * Below is a manually a list of likely subtags corresponding to Unicode
 * CLDR likelySubtags list.
 * This list is curated by the maintainers of Project Fluent and is
 * intended to be used in place of the full likelySubtags list in use cases
 * where full list cannot be (for example, due to the size).
 *
 * This version of the list is based on CLDR 30.0.3.
 */
const likelySubtagsMin = {
    ar: "ar-arab-eg",
    "az-arab": "az-arab-ir",
    "az-ir": "az-arab-ir",
    be: "be-cyrl-by",
    da: "da-latn-dk",
    el: "el-grek-gr",
    en: "en-latn-us",
    fa: "fa-arab-ir",
    ja: "ja-jpan-jp",
    ko: "ko-kore-kr",
    pt: "pt-latn-br",
    sr: "sr-cyrl-rs",
    "sr-ru": "sr-latn-ru",
    sv: "sv-latn-se",
    ta: "ta-taml-in",
    uk: "uk-cyrl-ua",
    zh: "zh-hans-cn",
    "zh-hant": "zh-hant-tw",
    "zh-hk": "zh-hant-hk",
    "zh-mo": "zh-hant-mo",
    "zh-tw": "zh-hant-tw",
    "zh-gb": "zh-hant-gb",
    "zh-us": "zh-hant-us",
    "yue-hant": "zh-hant-hk",
    "yue-hans": "zh-hans-cn",
    "es-ar": "es-419",
    "es-bo": "es-419",
    "es-br": "es-419",
    "es-bz": "es-419",
    "es-cl": "es-419",
    "es-co": "es-419",
    "es-cr": "es-419",
    "es-cu": "es-419",
    "es-do": "es-419",
    "es-ec": "es-419",
    "es-gt": "es-419",
    "es-hn": "es-419",
    "es-mx": "es-419",
    "es-ni": "es-419",
    "es-pa": "es-419",
    "es-pe": "es-419",
    "es-pr": "es-419",
    "es-py": "es-419",
    "es-sv": "es-419",
    "es-us": "es-419",
    "es-uy": "es-419",
    "es-ve": "es-419",
};
const regionMatchingLangs = [
    "az",
    "bg",
    "cs",
    "de",
    "es",
    "fi",
    "fr",
    "hu",
    "it",
    "lt",
    "lv",
    "nl",
    "pl",
    "ro",
    "ru",
];
function getLikelySubtagsMin(loc) {
    if (Object.prototype.hasOwnProperty.call(likelySubtagsMin, loc)) {
        return new Locale(likelySubtagsMin[loc]);
    }
    const locale = new Locale(loc);
    if (locale.language && regionMatchingLangs.includes(locale.language)) {
        locale.region = locale.language.toUpperCase();
        return locale;
    }
    return null;
}
