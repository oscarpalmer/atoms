import { Colour } from './base';
import type { HexColour } from './hex';
import type { RGBColour } from './rgb';
export type HSLColourValue = {
    hue: number;
    lightness: number;
    saturation: number;
};
export declare class HSLColour extends Colour<HSLColourValue> {
    /**
     * Gets the current hue
     */
    get hue(): number;
    /**
     * Sets the current hue
     */
    set hue(value: number);
    /**
     * Gets the current lightness
     */
    get lightness(): number;
    /**
     * Sets the current lightness
     */
    set lightness(value: number);
    /**
     * Gets the current saturation
     */
    get saturation(): number;
    /**
     * Sets the current saturation
     */
    set saturation(value: number);
    constructor(value: HSLColourValue);
    toHex(): HexColour;
    /**
     * Converts the colour to an RGB-colour
     */
    toRgb(): RGBColour;
    toString(): string;
    /**
     * Convert an HSL-colour to an RGB-colour
     */
    static toRgb(value: HSLColourValue): RGBColour;
}
/**
 * Get an HSL-colour from a value-object
 */
export declare function getHSLColour(value: HSLColourValue): HSLColour;
