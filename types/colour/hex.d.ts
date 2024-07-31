import type { HSLColour } from './hsl';
import type { RGBColour } from './rgb';
export declare class HexColour {
    private readonly $colour;
    private readonly state;
    /**
     * Gets the value of the colour
     */
    get value(): string;
    /**
     * Sets the value of the colour
     */
    set value(value: string);
    constructor(value: string);
    /**
     * Convert the colour to an RGB-colour
     */
    toHsl(): HSLColour;
    /**
     * Convert the colour to an HSL-colour
     */
    toRgb(): RGBColour;
    /**
     * Get the colour as a string _(prefixed with #)_
     */
    toString(): string;
    /**
     * Convert a hex-colour to an RGB-colour
     */
    static toRgb(value: string): RGBColour;
}
/**
 * Get a hex-colour from a string
 */
export declare function getHexColour(value: string): HexColour;
