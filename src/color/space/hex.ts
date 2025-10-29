import {join} from '../../internal/string';
import {
	ALPHA_FULL_HEX_LONG,
	ALPHA_FULL_HEX_SHORT,
	EXPRESSION_HEX_LONG,
	EXPRESSION_PREFIX,
	HEX_BLACK,
	LENGTH_LONG,
	LENGTH_SHORT,
	MAX_HEX,
} from '../constants';
import {isHexColor} from '../misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';
import {convertRgbToHsla} from './rgb';

function convertHexToRgba(value: string): RGBAColor {
	const normalized = getNormalizedHex(value, true);
	const pairs = EXPRESSION_HEX_LONG.exec(normalized) as RegExpExecArray;
	const values: number[] = [];

	const {length} = pairs;

	for (let index = 1; index < length; index += 1) {
		values.push(Number.parseInt(pairs[index], 16));
	}

	return {
		alpha: values[3] / MAX_HEX,
		blue: values[2],
		green: values[1],
		red: values[0],
	};
}

/**
 * Get the normalized hex color from a value
 * @param value Value to normalize
 * @param alpha Include alpha channel? _(defaults to `false`)_
 * @returns Normalized hex color, or `000000` if the value is unable to be normalized
 */
export function getNormalizedHex(value: unknown, alpha?: boolean): string {
	const includeAlpha = alpha ?? false;

	if (!isHexColor(value)) {
		return `${HEX_BLACK}${includeAlpha ? ALPHA_FULL_HEX_LONG : ''}`;
	}

	const normalized = value.replace(EXPRESSION_PREFIX, '');

	if (normalized.length < LENGTH_LONG) {
		const hex = normalized.slice(0, LENGTH_SHORT);
		const a = includeAlpha
			? (normalized[LENGTH_SHORT] ?? ALPHA_FULL_HEX_SHORT)
			: '';

		return join(`${hex}${a}`.split('').map(character => character.repeat(2)));
	}

	const hex = normalized.slice(0, LENGTH_LONG);

	const a = includeAlpha
		? normalized.slice(LENGTH_LONG) || ALPHA_FULL_HEX_LONG
		: '';

	return `${hex}${a}`;
}

export function hexToHsl(value: string): HSLColor {
	const {hue, lightness, saturation} = hexToHsla(value);

	return {
		hue,
		lightness,
		saturation,
	};
}

export function hexToHsla(value: string): HSLAColor {
	return convertRgbToHsla(convertHexToRgba(value));
}

/**
 * Convert a hex color to an RGB color
 * @param value Original value
 * @returns RGB color
 */
export function hexToRgb(value: string): RGBColor {
	const {blue, green, red} = convertHexToRgba(value);

	return {blue, green, red};
}

/**
 * Convert a hex color to an RGBA color
 * @param value Original value
 * @returns RGBA color
 */
export function hexToRgba(value: string): RGBAColor {
	return convertHexToRgba(value);
}
