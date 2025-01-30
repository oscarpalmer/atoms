import type {HexColor} from './hex';
import type {HSLColor} from './hsl';
import type {RGBColor} from './rgb';

/**
 * Is the value a color?
 */
export function isColor(
	value: unknown,
): value is HexColor | HSLColor | RGBColor {
	return isInstance(/^(hex|hsl|rgb)$/, value);
}

export function isColorValue(value: unknown, properties: string[]): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		properties.every(
			property =>
				property in value && typeof value[property as never] === 'number',
		)
	);
}

/**
 * Is the value a hex-color?
 */
export function isHexColor(value: unknown): value is HexColor {
	return isInstance(/^hex$/, value);
}

/**
 * Is the value an HSL-color?
 */
export function isHSLColor(value: unknown): value is HSLColor {
	return isInstance(/^hsl$/, value);
}

function isInstance(pattern: RegExp, value: unknown): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		'$color' in value &&
		typeof value.$color === 'string' &&
		pattern.test(value.$color)
	);
}

/**
 * Is the value an RGB-color?
 */
export function isRGBColor(value: unknown): value is RGBColor {
	return isInstance(/^rgb$/, value);
}
