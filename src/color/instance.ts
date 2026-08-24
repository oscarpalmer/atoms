import {PROPERTY_COLOR, TYPE_HEX, TYPE_HSL, TYPE_HWB, TYPE_RGB} from './constants';
import {getAlpha} from './misc/alpha';
import {formatHslColor, formatHwbColor, formatRgbColor} from './misc/format';
import {
	getColorFromState,
	getColorState,
	setHexColor,
	setHSLColor,
	setHWBColor,
	setRGBColor,
} from './misc/state';
import type {Color, ColorState, ColorType} from './models';

// #region Types

type SetValue = (state: ColorState, value: any, alpha: boolean) => void;

type SetValues = Record<ColorType, SetValue>;

// #endregion

// #region Functions

export function color(value: unknown): Color {
	const state = getColorState(value);

	const instance = {
		toHexString: (alpha?: boolean) =>
			`#${alpha === true ? (instance as Color).hexa : (instance as Color).hex}`,
		toHslString: (alpha?: boolean) => formatHslColor(state, alpha),
		toHwbString: (alpha?: boolean) => formatHwbColor(state, alpha),
		toRgbString: (alpha?: boolean) => formatRgbColor(state, alpha),
		toString: () => (instance as Color).toHexString(),
	};

	Object.defineProperties(instance, {
		[PROPERTY_COLOR]: {
			enumerable: false,
			value: true,
		},
		alpha: {
			enumerable: true,
			get: () => state.alpha.value,
			set: (value: unknown) => setAlphaValue(state, value),
		},
		hex: getProperty(TYPE_HEX, state, false),
		hexa: getProperty(TYPE_HEX, state, true),
		hsl: getProperty(TYPE_HSL, state, false),
		hsla: getProperty(TYPE_HSL, state, true),
		hwb: getProperty(TYPE_HWB, state, false),
		hwba: getProperty(TYPE_HWB, state, true),
		origin: {
			enumerable: true,
			get: () => state.origin,
		},
		rgb: getProperty(TYPE_RGB, state, false),
		rgba: getProperty(TYPE_RGB, state, true),
	});

	return Object.freeze(instance) as Color;
}

function getProperty(
	space: keyof typeof setters,
	state: ColorState,
	alpha: boolean,
): PropertyDescriptor {
	const setValue = setters[space];

	return {
		enumerable: true,
		get: () => getValue(space, state, alpha),
		set: (value: unknown) => setValue(state, value, alpha),
	};
}

function getValue(space: keyof typeof setters, state: ColorState, alpha: boolean) {
	const value = getColorFromState(state, space);

	if (typeof value === 'string') {
		return alpha ? `${value}${state.alpha.hex}` : value;
	}

	return alpha
		? {
				...value,
				alpha: state.alpha.value,
			}
		: {...value};
}

function setAlphaValue(state: ColorState, value: unknown): void {
	if (typeof value === 'number' && !Number.isNaN(value)) {
		state.alpha = getAlpha(value, false);
	}
}

// #endregion

// #region Variables

const setters: SetValues = {
	hex: setHexColor,
	hsl: setHSLColor,
	hwb: setHWBColor,
	rgb: setRGBColor,
};

// #endregion
