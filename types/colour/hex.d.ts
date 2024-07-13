import type { HexColour, RGBColour } from './models';
export declare function createHex(original: string): HexColour;
/**
 * Get a hex-colour from a string
 */
export declare function getHexColour(value: string): HexColour;
/**
 * Convert a hex-colour to an RGB-colour
 */
export declare function hexToRgb(value: string): RGBColour;
