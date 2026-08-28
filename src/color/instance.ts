import {herald, type Herald} from '../herald';
import {type SubscriptionProperty} from '../internal/subscription';
import {COLOR_PROPERTY, COLOR_TYPE} from './constants';
import {getAlpha} from './misc/alpha';
import {formatHexColor, formatHslColor, formatHwbColor, formatRgbColor} from './misc/format';
import {
	getColorFromState,
	getColorState,
	setHexColor,
	setHSLColor,
	setHWBColor,
	setRGBColor,
} from './misc/state';
import type {Color, ColorChanges, ColorState, ColorType} from './models';

// #region Types

type SetValue = (
	color: Color,
	state: ColorState,
	changes: Herald<ColorChanges>,
	value: any,
	alpha: boolean,
) => void;

type SetValues = Record<ColorType, SetValue>;

// #endregion

// #region Functions

export function color(value: unknown): Color {
	const changes = herald<ColorChanges>({
		names: ['all', ...COLOR_TYPE.all],
		property: colorSubscription,
		onCreate: (event, callback) => callback(event === 'all' ? color : (instance as Color)[event]),
	});

	const state = getColorState(value);

	const instance: unknown = {
		toHexString: (alpha?: never) => formatHexColor(instance as Color, alpha),
		toHslString: (alpha?: never) => formatHslColor(state, alpha),
		toHwbString: (alpha?: never) => formatHwbColor(state, alpha),
		toRgbString: (alpha?: never) => formatRgbColor(state, alpha),
		toString: () => (instance as Color).toHexString(),
		unsubscribe: () => changes.clear(),
	};

	Object.defineProperties(instance, {
		[COLOR_PROPERTY.name]: {
			value: true,
		},
		alpha: {
			enumerable: true,
			get: () => state.alpha.value,
			set: (value: never) => setAlphaValue(state, value),
		},
		changes: {
			enumerable: true,
			value: changes.events,
		},
		hex: getProperty(COLOR_TYPE.hex, instance as Color, state, changes, false),
		hexa: getProperty(COLOR_TYPE.hex, instance as Color, state, changes, true),
		hsl: getProperty(COLOR_TYPE.hsl, instance as Color, state, changes, false),
		hsla: getProperty(COLOR_TYPE.hsl, instance as Color, state, changes, true),
		hwb: getProperty(COLOR_TYPE.hwb, instance as Color, state, changes, false),
		hwba: getProperty(COLOR_TYPE.hwb, instance as Color, state, changes, true),
		origin: {
			enumerable: true,
			get: () => state.origin,
		},
		rgb: getProperty(COLOR_TYPE.rgb, instance as Color, state, changes, false),
		rgba: getProperty(COLOR_TYPE.rgb, instance as Color, state, changes, true),
	});

	return Object.freeze(instance) as Color;
}

function getProperty(
	space: keyof typeof setters,
	color: Color,
	state: ColorState,
	changes: Herald<ColorChanges>,
	alpha: boolean,
): PropertyDescriptor {
	const setValue = setters[space];

	return {
		enumerable: true,
		get: () => getValue(space, state, alpha),
		set: (value: unknown) => setValue(color, state, changes, value, alpha),
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

const colorSubscription: SubscriptionProperty = {
	key: COLOR_PROPERTY.name,
};

const setters: SetValues = {
	hex: setHexColor,
	hsl: setHSLColor,
	hwb: setHWBColor,
	rgb: setRGBColor,
};

// #endregion
