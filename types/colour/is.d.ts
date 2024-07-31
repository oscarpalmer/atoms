import type { HexColour } from './hex';
import type { HSLColour } from './hsl';
import type { RGBColour } from './rgb';
/**
 * Is the value a colour?
 */
export declare function isColour(value: unknown): value is HexColour | HSLColour | RGBColour;
export declare function isColourValue<Expected>(value: unknown, properties: Array<keyof Expected>): value is Expected;
/**
 * Is the value a hex-colour?
 */
export declare function isHexColour(value: unknown): value is HexColour;
/**
 * Is the value an HSL-colour?
 */
export declare function isHSLColour(value: unknown): value is HSLColour;
/**
 * Is the value an RGB-colour?
 */
export declare function isRGBColour(value: unknown): value is RGBColour;
