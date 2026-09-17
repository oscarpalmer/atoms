import {round} from '../../internal/math/misc';
import {clamp} from '../../internal/number';
import {COLOR_ALPHA, COLOR_DEFAULTS, COLOR_EXPRESSION, COLOR_MAX, COLOR_SYMBOL} from '../constants';
import type {Alpha, InternalColor} from '../models';

// #region Functions

export function getAlpha(value: unknown, hex: boolean): Alpha {
	if (typeof value === 'number') {
		return getAlphaFromValue(value);
	}

	if (typeof value !== 'string' || value.toLowerCase() === COLOR_ALPHA.fullHexLong) {
		return {...COLOR_DEFAULTS.alpha};
	}

	if (hex && COLOR_EXPRESSION.alphaHex.test(value)) {
		return {
			hex: value,
			value: Number.parseInt(value, 16) / COLOR_MAX.hex,
		};
	}

	return getAlphaFromValue(Number.parseFloat(value));
}

export function getColorAlpha(this: InternalColor): number {
	return this[COLOR_SYMBOL].values.alpha.value;
}

export function getAlphaHexadecimal(value: number): string {
	if (value === COLOR_ALPHA.noneValue) {
		return COLOR_ALPHA.noneHex;
	}

	if (value === COLOR_MAX.percent) {
		return COLOR_ALPHA.fullHexLong;
	}

	return round((value / COLOR_MAX.percent) * COLOR_MAX.hex).toString(16);
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
		return COLOR_MAX.percent;
	}

	return clamp(original, COLOR_ALPHA.noneValue, COLOR_MAX.percent);
}

export function setColorAlpha(this: InternalColor, value: unknown): void {
	if (typeof value === 'number' && !Number.isNaN(value)) {
		this[COLOR_SYMBOL].values.alpha = getAlpha(value, false);
	}
}

// #endregion
