import {clamp} from '../..';
import {round} from '../../internal/math/misc';
import {
	ALPHA_FULL_HEX_LONG,
	ALPHA_NONE_HEX,
	ALPHA_NONE_VALUE,
	DEFAULT_ALPHA,
	EXPRESSION_ALPHA_HEX,
	MAX_HEX,
	MAX_PERCENT,
} from '../constants';
import type {Alpha} from '../models';

// #region Functions

export function getAlpha(value: unknown, hex: boolean): Alpha {
	if (typeof value === 'number') {
		return getAlphaFromValue(value);
	}

	if (typeof value !== 'string' || value.toLowerCase() === ALPHA_FULL_HEX_LONG) {
		return {...DEFAULT_ALPHA};
	}

	if (hex && EXPRESSION_ALPHA_HEX.test(value)) {
		return {
			hex: value,
			value: Number.parseInt(value, 16) / MAX_HEX,
		};
	}

	return getAlphaFromValue(Number.parseFloat(value));
}

export function getAlphaHexadecimal(value: number): string {
	if (value === ALPHA_NONE_VALUE) {
		return ALPHA_NONE_HEX;
	}

	if (value === MAX_PERCENT) {
		return ALPHA_FULL_HEX_LONG;
	}

	return round((value / MAX_PERCENT) * MAX_HEX).toString(16);
}

function getAlphaFromValue(value: number): Alpha {
	const alpha = getAlphaValue(value);

	return {
		hex: getAlphaHexadecimal(alpha),
		value: alpha,
	};
}

export function getAlphaValue(original: number): number {
	if (Number.isNaN(original)) {
		return MAX_PERCENT;
	}

	return clamp(original, ALPHA_NONE_VALUE, MAX_PERCENT);
}

// #endregion
