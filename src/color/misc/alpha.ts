import {
	ALPHA_FULL_HEX_LONG,
	ALPHA_FULL_VALUE,
	ALPHA_NONE_HEX,
	ALPHA_NONE_VALUE,
	DEFAULT_ALPHA,
	MAX_HEX,
	MAX_PERCENT,
} from '../constants';
import type {Alpha} from '../models';

// #region Functions

export function getAlpha(value: unknown): Alpha {
	if (typeof value === 'number') {
		return getAlphaFromValue(value);
	}

	if (typeof value === 'string' && value !== ALPHA_FULL_HEX_LONG) {
		return {
			hex: value,
			value: Number.parseInt(value, 16) / MAX_HEX,
		};
	}

	return {...DEFAULT_ALPHA};
}

export function getAlphaHexadecimal(value: number): string {
	if (value === ALPHA_NONE_VALUE) {
		return ALPHA_NONE_HEX;
	}

	if (value === ALPHA_FULL_VALUE) {
		return ALPHA_FULL_HEX_LONG;
	}

	return Math.round(value * MAX_HEX).toString(16);
}

function getAlphaFromValue(value: number): Alpha {
	const alpha = getAlphaValue(value);

	return {
		hex: getAlphaHexadecimal(alpha),
		value: alpha,
	};
}

export function getAlphaValue(original: number): number {
	if (Number.isNaN(original) || original >= MAX_PERCENT || original === ALPHA_FULL_VALUE) {
		return ALPHA_FULL_VALUE;
	}

	if (original < ALPHA_NONE_VALUE) {
		return ALPHA_NONE_VALUE;
	}

	return original <= ALPHA_FULL_VALUE ? original : original / MAX_PERCENT;
}

// #endregion
