import type {HexColour} from '~/colour/hex';
import type {HSLColour} from '~/colour/hsl';
import type {RGBColour} from '~/colour/rgb';

/**
 * Is the value a colour?
 */
export function isColour(
	value: unknown,
): value is HexColour | HSLColour | RGBColour {
	return isInstance(/^(hex|hsl|rgb)$/, value);
}

export function isColourValue<Expected>(
	value: unknown,
	properties: Array<keyof Expected>,
): value is Expected {
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
 * Is the value a hex-colour?
 */
export function isHexColour(value: unknown): value is HexColour {
	return isInstance(/^hex$/, value);
}

/**
 * Is the value an HSL-colour?
 */
export function isHSLColour(value: unknown): value is HSLColour {
	return isInstance(/^hsl$/, value);
}

function isInstance(pattern: RegExp, value: unknown): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		'$colour' in value &&
		typeof value.$colour === 'string' &&
		pattern.test(value.$colour)
	);
}

/**
 * Is the value an RGB-colour?
 */
export function isRGBColour(value: unknown): value is RGBColour {
	return isInstance(/^rgb$/, value);
}
