import type { RGBColourValue } from './rgb';
/**
 * Get a foreground colour _(usually text)_ based on a background colour's luminance
 */
export declare function getForegroundColour(value: RGBColourValue): string;
export { getHexColour, HexColour } from './hex';
export { getHSLColour, HSLColour, type HSLColourValue } from './hsl';
export { isColour, isHexColour, isHSLColour, isRGBColour } from './is';
export { getRGBColour, RGBColour, type RGBColourValue } from './rgb';
