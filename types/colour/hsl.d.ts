import type { HSLColour, HSLColourValue, RGBColour } from './models';
export declare function createHsl(original: HSLColourValue): HSLColour;
/**
 * - Convert an HSL-colour to an RGB-colour
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 */
export declare function hslToRgb(value: HSLColourValue): RGBColour;
