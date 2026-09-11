import {
	COLOR_DEFAULTS,
	COLOR_KEYS,
	COLOR_LENGTHS,
	COLOR_MAX,
	COLOR_SYMBOL,
	COLOR_TYPE,
} from '../constants';
import type {
	Color,
	ColorState,
	ColorType,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	InternalColor,
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

		if (COLOR_KEYS.hsl.every(key => key in value)) {
			state.hsl = getHslValue(value as Record<keyof HSLColor, unknown>);
			state.origin = COLOR_TYPE.hsl;
		} else if (COLOR_KEYS.hwb.every(key => key in value)) {
			state.hwb = getHwbValue(value as Record<keyof HWBColor, unknown>);
			state.origin = COLOR_TYPE.hwb;
		} else if (COLOR_KEYS.rgb.every(key => key in value)) {
			state.rgb = getRgbValue(value as Record<keyof RGBColor, unknown>);
			state.origin = COLOR_TYPE.rgb;
		}

		if (state.origin != null) {
			return state;
		}
	}

	return getDefaultColorState();
}

function getColorStateForHex(value: string): ColorState {
	const normalized = getNormalizedHex(value, true);
	const hex = normalized.slice(0, COLOR_LENGTHS.hexLong);

	return {
		hex,
		alpha: getAlpha(normalized.slice(COLOR_LENGTHS.hexLong), true),
		origin: COLOR_TYPE.hex,
	};
}

function getDefaultColorState(): ColorState {
	return {
		alpha: getAlpha(COLOR_MAX.percent, false),
		hex: COLOR_DEFAULTS.hexBlack,
		hsl: {...COLOR_DEFAULTS.hsl},
		hwb: {...COLOR_DEFAULTS.hwb},
		rgb: {...COLOR_DEFAULTS.rgb},
		origin: COLOR_TYPE.hex,
	};
}

function setColorValue<Type extends ColorType>(
	instance: InternalColor,
	type: Type,
	value: ColorState[Type],
	alpha?: number | string,
): void {
	const {changes, values} = instance[COLOR_SYMBOL];

	values.hex = undefined;
	values.hsl = undefined;
	values.hwb = undefined;
	values.rgb = undefined;

	values.origin = type;
	values[type] = value;

	if (alpha != null) {
		values.alpha = getAlpha(alpha, type === COLOR_TYPE.hex);
	}

	for (const type of COLOR_TYPE.all) {
		if (changes.observed(type)) {
			changes.emit(type, instance[type as keyof Color] as never);
		}
	}

	changes.emit(COLOR_TYPE.wildcard, instance);
}

export function setHexColor(instance: InternalColor, value: string, alpha: boolean): void {
	const {values} = instance[COLOR_SYMBOL];

	if (!isHexColor(value) || (!alpha && value === values.hex)) {
		return;
	}

	const normalized = getNormalizedHex(value, true);

	setColorValue(
		instance,
		COLOR_TYPE.hex,
		normalized.slice(0, COLOR_LENGTHS.hexLong),
		alpha ? normalized.slice(COLOR_LENGTHS.hexLong) : undefined,
	);
}

export function setHSLColor(instance: InternalColor, value: unknown, alpha: boolean): void {
	if (!isHslLike(value)) {
		return;
	}

	setColorValue(
		instance,
		COLOR_TYPE.hsl,
		{
			hue: getDegrees((value as HSLColor).hue),
			saturation: getPercentage((value as HSLColor).saturation),
			lightness: getPercentage((value as HSLColor).lightness),
		},
		alpha ? (value as HSLAColor).alpha : undefined,
	);
}

export function setHWBColor(instance: InternalColor, value: unknown, alpha: boolean): void {
	if (!isHwbLike(value)) {
		return;
	}

	setColorValue(
		instance,
		COLOR_TYPE.hwb,
		{
			hue: getDegrees((value as HWBColor).hue),
			whiteness: getPercentage((value as HWBColor).whiteness),
			blackness: getPercentage((value as HWBColor).blackness),
		},
		alpha ? (value as HWBAColor).alpha : undefined,
	);
}

export function setRGBColor(instance: InternalColor, value: unknown, alpha: boolean): void {
	if (!isRgbLike(value)) {
		return;
	}

	setColorValue(
		instance,
		COLOR_TYPE.rgb,
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
