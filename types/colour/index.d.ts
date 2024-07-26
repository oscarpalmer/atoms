import type { RGBColourValue } from './models';
/**
 * Get a foreground colour _(usually text)_ based on a background colour's luminance
 */
export declare function getForegroundColour(value: RGBColourValue): string;
export { getHexColour, hexToRgb } from './hex';
export { hslToRgb } from './hsl';
export { rgbToHex, rgbToHsl } from './rgb';
export * from './models';
