import {
	DEFAULT_HSL,
	DEFAULT_HWB,
	DEFAULT_RGB,
	HEX_BLACK,
	KEYS_HSL,
	KEYS_HWB,
	KEYS_RGB,
	LENGTH_LONG,
	MAX_PERCENT,
	TYPE_HEX,
	TYPE_HSL,
	TYPE_HWB,
	TYPE_RGB,
} from '../constants';
import type {
	ColorState,
	ColorType,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from '../models';
import {getColorFromHex, getNormalizedHex} from '../space/hex';
import {getColorFromHsl, getHslValue} from '../space/hsl';
import {getColorFromHwb, getHwbValue} from '../space/hwb';
import {getColorFromRgb, getRgbValue} from '../space/rgb';
import {getAlpha} from './alpha';
import {getDegrees, getHexValue, getPercentage} from './get';
import {isColor, isHexColor, isHslLike, isHwbLike, isRgbLike} from './is';

// #region Functions

export function getColorFromState<Type extends ColorType>(
	state: ColorState,
	type: Type,
): NonNullable<ColorState[Type]> {
	const {origin} = state;

	if (type === origin) {
		return state[origin] as NonNullable<ColorState[Type]>;
	}

	return state[type] ?? (getters[origin](state, type) as NonNullable<ColorState[Type]>);
}

export function getColorState(value: unknown): ColorState {
	if (typeof value === 'string') {
		return getColorStateForHex(value);
	}

	if (isColor(value)) {
		const {origin} = value;

		return {
			origin,
			[origin]: value[origin],
			alpha: getAlpha(value.alpha, false),
		};
	}

	if (typeof value === 'object' && value !== null) {
		const state: ColorState = {
			alpha: getAlpha((value as HSLAColor).alpha, false),
			origin: undefined as never,
		};

		if (KEYS_HSL.every(key => key in value)) {
			state.hsl = getHslValue(value as Record<keyof HSLColor, unknown>);
			state.origin = TYPE_HSL;
		} else if (KEYS_HWB.every(key => key in value)) {
			state.hwb = getHwbValue(value as Record<keyof HWBColor, unknown>);
			state.origin = TYPE_HWB;
		} else if (KEYS_RGB.every(key => key in value)) {
			state.rgb = getRgbValue(value as Record<keyof RGBColor, unknown>);
			state.origin = TYPE_RGB;
		}

		if (state.origin != null) {
			return state;
		}
	}

	return getDefaultColorState();
}

function getColorStateForHex(value: string): ColorState {
	const normalized = getNormalizedHex(value, true);
	const hex = normalized.slice(0, LENGTH_LONG);

	return {
		hex,
		alpha: getAlpha(normalized.slice(LENGTH_LONG), true),
		origin: TYPE_HEX,
	};
}

function getDefaultColorState(): ColorState {
	return {
		alpha: getAlpha(MAX_PERCENT, false),
		hex: HEX_BLACK,
		hsl: {...DEFAULT_HSL},
		hwb: {...DEFAULT_HWB},
		rgb: {...DEFAULT_RGB},
		origin: TYPE_HEX,
	};
}

function setColorValue<Type extends ColorType>(
	state: ColorState,
	type: Type,
	value: ColorState[Type],
	alpha?: number | string,
): void {
	state.hex = undefined;
	state.hsl = undefined;
	state.hwb = undefined;
	state.rgb = undefined;

	state.origin = type;
	state[type] = value;

	if (alpha != null) {
		state.alpha = getAlpha(alpha, type === TYPE_HEX);
	}
}

export function setHexColor(state: ColorState, value: string, alpha: boolean): void {
	if (!isHexColor(value) || (!alpha && value === state.hex)) {
		return;
	}

	const normalized = getNormalizedHex(value, true);

	setColorValue(
		state,
		TYPE_HEX,
		normalized.slice(0, LENGTH_LONG),
		alpha ? normalized.slice(LENGTH_LONG) : undefined,
	);
}

export function setHSLColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isHslLike(value)) {
		return;
	}

	setColorValue(
		state,
		TYPE_HSL,
		{
			hue: getDegrees((value as HSLColor).hue),
			saturation: getPercentage((value as HSLColor).saturation),
			lightness: getPercentage((value as HSLColor).lightness),
		},
		alpha ? (value as HSLAColor).alpha : undefined,
	);
}

export function setHWBColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isHwbLike(value)) {
		return;
	}

	setColorValue(
		state,
		TYPE_HWB,
		{
			hue: getDegrees((value as HWBColor).hue),
			whiteness: getPercentage((value as HWBColor).whiteness),
			blackness: getPercentage((value as HWBColor).blackness),
		},
		alpha ? (value as HWBAColor).alpha : undefined,
	);
}

export function setRGBColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isRgbLike(value)) {
		return;
	}

	setColorValue(
		state,
		TYPE_RGB,
		{
			red: getHexValue((value as RGBColor).red),
			green: getHexValue((value as RGBColor).green),
			blue: getHexValue((value as RGBColor).blue),
		},
		alpha ? (value as RGBAColor).alpha : undefined,
	);
}

// #endregion

// #region Variables

const getters: Record<ColorType, (state: ColorState, type: ColorType) => any> = {
	hex: getColorFromHex,
	hsl: getColorFromHsl,
	hwb: getColorFromHwb,
	rgb: getColorFromRgb,
};

// #endregion
