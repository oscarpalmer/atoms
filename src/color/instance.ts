import {herald, type Herald} from '../internal/herald';
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
		names: [COLOR_TYPE.wildcard, ...COLOR_TYPE.all],
		property: colorSubscription,
		onCreate: (event, callback) => onCreateSubscription(instance as Color, event, callback),
	});

	const state = getColorState(value);

	const instance: unknown = {
		subscribe: (callback: never, signal?: AbortSignal) =>
			changes.subscribe(COLOR_TYPE.wildcard, callback, signal),
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
		hex: getColorProperty(COLOR_TYPE.hex, instance as Color, state, changes, false),
		hexa: getColorProperty(COLOR_TYPE.hex, instance as Color, state, changes, true),
		hsl: getColorProperty(COLOR_TYPE.hsl, instance as Color, state, changes, false),
		hsla: getColorProperty(COLOR_TYPE.hsl, instance as Color, state, changes, true),
		hwb: getColorProperty(COLOR_TYPE.hwb, instance as Color, state, changes, false),
		hwba: getColorProperty(COLOR_TYPE.hwb, instance as Color, state, changes, true),
		origin: {
			enumerable: true,
			get: () => state.origin,
		},
		rgb: getColorProperty(COLOR_TYPE.rgb, instance as Color, state, changes, false),
		rgba: getColorProperty(COLOR_TYPE.rgb, instance as Color, state, changes, true),
	});

	return Object.freeze(instance) as Color;
}

function getColorProperty(
	space: keyof typeof setters,
	color: Color,
	state: ColorState,
	changes: Herald<ColorChanges>,
	alpha: boolean,
): PropertyDescriptor {
	const setValue = setters[space];

	return {
		enumerable: true,
		get: () => getColorValue(space, state, alpha),
		set: (value: unknown) => setValue(color, state, changes, value, alpha),
	};
}

function getColorValue(space: keyof typeof setters, state: ColorState, alpha: boolean) {
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

function onCreateSubscription(
	instance: Color,
	event: string,
	callback: (value: never) => void,
): void {
	let value: unknown;

	if (event === COLOR_TYPE.wildcard) {
		value = instance as Color;
	} else {
		value = (instance as Color)[event as keyof Color];
	}

	callback(value as never);
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
