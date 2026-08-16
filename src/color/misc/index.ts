import {round} from '../../internal/math/misc';
import type {Color} from '../instance';

// #region Functions

export function formatHslColor(color: Color, alpha: boolean): string {
	const {hue, lightness, saturation} = color.hsl;

	const suffix = alpha ? ` / ${color.alpha}%` : '';

	return `hsl(${hue}deg ${saturation}% ${lightness}%${suffix})`;
}

export function formatHwbColor(color: Color, alpha: boolean): string {
	const {blackness, hue, whiteness} = color.hwb;

	const suffix = alpha ? ` / ${color.alpha}%` : '';

	return `hwb(${hue}deg ${whiteness}% ${blackness}%${suffix})`;
}

export function formatRgbColor(color: Color, alpha: boolean): string {
	const {blue, green, red} = color.rgb;

	const suffix = alpha ? ` / ${color.alpha}%` : '';

	return `rgb(${red} ${green} ${blue}${suffix})`;
}

export function getFixedColorValue(value: number): number {
	return round(value, DECIMAL_PLACES);
}

// #endregion

// #region Variables

const DECIMAL_PLACES = 4;

// #endregion
