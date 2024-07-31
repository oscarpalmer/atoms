import { HexColour } from './hex';
import { HSLColour, type HSLColourValue } from './hsl';
import { RGBColour, type RGBColourValue } from './rgb';
export declare const anyPattern: RegExp;
export declare function getNormalisedHex(value: string): string;
/**
 * Convert a hex-colour to an RGB-colour
 */
export declare function hexToRgb(value: string): RGBColour;
/**
 * - Convert an HSL-colour to an RGB-colour
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 */
export declare function hslToRgb(value: HSLColourValue): RGBColour;
/**
 * Convert an RGB-colour to a hex-colour
 */
export declare function rgbToHex(value: RGBColourValue): HexColour;
/**
 * - Convert an RGB-colour to an HSL-colour
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 */
export declare function rgbToHsl(rgb: RGBColourValue): HSLColour;
