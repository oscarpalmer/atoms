import type { HSLColour, HexColour, RGBColour, RGBColourValue } from './models';
export declare function createRgb(original: RGBColourValue): RGBColour;
/**
 * Convert an RGB-colour to a hex-colour
 */
export declare function rgbToHex(value: RGBColourValue): HexColour;
/**
 * - Convert an RGB-colour to an HSL-colour
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 */
export declare function rgbToHsl(rgb: RGBColourValue): HSLColour;
