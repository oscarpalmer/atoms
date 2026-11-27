import {round} from '../../internal/math/misc';
import {clamp} from '../../internal/number';
import type {Alpha, InternalColor} from '../../models/color.model';
import {
	COLOR_ALPHA,
	COLOR_DEFAULTS,
	COLOR_EXPRESSION,
	COLOR_HEX_RADIX,
	COLOR_MAX,
	COLOR_SYMBOL,
} from '../constants';
import {setStateValue} from './state';

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
			value: round(
				(Number.parseInt(value, COLOR_HEX_RADIX) / COLOR_MAX.hex) * COLOR_MAX.percent,
				2,
			),
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

	return round((value / COLOR_MAX.percent) * COLOR_MAX.hex)
		.toString(16)
		.padStart(2, '0');
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

	return round(clamp(original, COLOR_ALPHA.noneValue, COLOR_MAX.percent), 2);
}

export function setColorAlpha(this: InternalColor, value: unknown): void {
	if (typeof value === 'number' && !Number.isNaN(value)) {
		const {values} = this[COLOR_SYMBOL];

		setStateValue(this, values.origin, values[values.origin], value);
	}
}

// #endregion
