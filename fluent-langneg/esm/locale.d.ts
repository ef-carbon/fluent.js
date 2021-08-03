export declare class Locale {
    isWellFormed: boolean;
    language?: string;
    script?: string;
    region?: string;
    variant?: string;
    /**
     * Parses a locale id using the localeRe into an array with four elements.
     *
     * If the second argument `range` is set to true, it places range `*` char
     * in place of any missing piece.
     *
     * It also allows skipping the script section of the id, so `en-US` is
     * properly parsed as `en-*-US-*`.
     */
    constructor(locale: string);
    isEqual(other: Locale): boolean;
    matches(other: Locale, thisRange?: boolean, otherRange?: boolean): boolean;
    toString(): string;
    clearVariants(): void;
    clearRegion(): void;
    addLikelySubtags(): boolean;
}
