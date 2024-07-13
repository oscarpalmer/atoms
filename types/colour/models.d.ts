type Colour<Model> = {
    /**
     * The current value of the colour
     */
    readonly value: Model;
    /**
     * Convert the colour to a hex-colour
     */
    toHex(): HexColour;
    /**
     * Get the colour as a _CSS-formatted_ string
     */
    toString(): string;
};
export type HexColour = {
    /**
     * The current value of the colour
     */
    value: string;
    /**
     * Convert the colour to an RGB-colour
     */
    toHsl(): HSLColour;
    /**
     * Convert the colour to an HSL-colour
     */
    toRgb(): RGBColour;
    /**
     * Get the colour as a string
     */
    toString(): string;
};
export type HSLColour = {
    /**
     * The current hue
     */
    hue: number;
    /**
     * The current lightness
     */
    lightness: number;
    /**
     * The current saturation
     */
    saturation: number;
    /**
     * Convert the colour to an RGB-colour
     */
    toRgb(): RGBColour;
} & Colour<HSLColourValue>;
export type HSLColourValue = {
    hue: number;
    lightness: number;
    saturation: number;
};
export type RGBColour = {
    /**
     * The current blue value
     */
    blue: number;
    /**
     * The current green value
     */
    green: number;
    /**
     * The current red value
     */
    red: number;
    /**
     * Convert the colour to an HSL-colour
     */
    toHsl(): HSLColour;
} & Colour<RGBColourValue>;
export type RGBColourValue = {
    blue: number;
    green: number;
    red: number;
};
export {};
