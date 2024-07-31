import { Colour } from './base';
import type { HexColour } from './hex';
import type { HSLColour } from './hsl';
export type RGBColourValue = {
    blue: number;
    green: number;
    red: number;
};
export declare class RGBColour extends Colour<RGBColourValue> {
    /**
     * Gets the current blue value
     */
    get blue(): number;
    /**
     * Sets the current blue value
     */
    set blue(value: number);
    /**
     * Gets the current green value
     */
    get green(): number;
    /**
     * Sets the current green value
     */
    set green(value: number);
    /**
     * Gets the current red value
     */
    get red(): number;
    /**
     * Sets the current red value
     */
    set red(value: number);
    constructor(value: RGBColourValue);
    toHex(): HexColour;
    /**
     * Convert the colour to an HSL-colour
     */
    toHsl(): HSLColour;
    toString(): string;
    /**
     * Convert an RGB-colour to a hex-colour
     */
    static toHex(value: RGBColourValue): HexColour;
    /**
     * - Convert an RGB-colour to an HSL-colour
     */
    static toHsl(rgb: RGBColourValue): HSLColour;
}
/**
 * Get an RGB-colour from a value-object
 */
export declare function getRGBColour(value: RGBColourValue): RGBColour;
