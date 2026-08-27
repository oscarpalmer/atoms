import {
	clearSubscriptions,
	getSubscription,
	getSubscriptions,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from '../internal/subscription';
import {COLOR_PROPERTY, COLOR_TYPE} from './constants';
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

type SetValue = (
	color: Color,
	state: ColorState,
	subscriptions: Subscriptions<Function>,
	value: any,
	alpha: boolean,
) => void;

type SetValues = Record<ColorType, SetValue>;

// #endregion

// #region Functions

export function color(value: unknown): Color {
	const state = getColorState(value);

	const subscriptions = getSubscriptions<Function>(COLOR_TYPE.all);

	const instance = {
		subscribe: (first?: never, second?: never, third?: never) =>
			subscribeToColor(subscriptions, first, second, third),
		toHexString: (alpha?: boolean) => `#${alpha === true ? instance.hexa : instance.hex}`,
		toHslString: (alpha?: never) => formatHslColor(state, alpha),
		toHwbString: (alpha?: never) => formatHwbColor(state, alpha),
		toRgbString: (alpha?: never) => formatRgbColor(state, alpha),
		toString: () => instance.toHexString(),
		unsubscribe: () => clearSubscriptions(subscriptions),
	};

	Object.defineProperties(instance, {
		[COLOR_PROPERTY.name]: {
			enumerable: false,
			value: true,
		},
		alpha: {
			enumerable: true,
			get: () => state.alpha.value,
			set: (value: unknown) => setAlphaValue(state, value),
		},
		hex: getProperty(COLOR_TYPE.hex, instance, state, subscriptions, false),
		hexa: getProperty(COLOR_TYPE.hex, instance, state, subscriptions, true),
		hsl: getProperty(COLOR_TYPE.hsl, instance, state, subscriptions, false),
		hsla: getProperty(COLOR_TYPE.hsl, instance, state, subscriptions, true),
		hwb: getProperty(COLOR_TYPE.hwb, instance, state, subscriptions, false),
		hwba: getProperty(COLOR_TYPE.hwb, instance, state, subscriptions, true),
		origin: {
			enumerable: true,
			get: () => state.origin,
		},
		rgb: getProperty(COLOR_TYPE.rgb, instance, state, subscriptions, false),
		rgba: getProperty(COLOR_TYPE.rgb, instance, state, subscriptions, true),
	});

	return Object.freeze(instance);
}

function getProperty(
	space: keyof typeof setters,
	color: Color,
	state: ColorState,
	subscriptions: Subscriptions<Function>,
	alpha: boolean,
): PropertyDescriptor {
	const setValue = setters[space];

	return {
		enumerable: true,
		get: () => getValue(space, state, alpha),
		set: (value: unknown) => setValue(color, state, subscriptions, value, alpha),
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

function subscribeToColor(
	subscriptions: Subscriptions,
	first: unknown,
	second?: unknown,
	third?: unknown,
): Subscription {
	let key: string | undefined;
	let signal: unknown | undefined;
	let value: Function | undefined;

	if (typeof first === 'string') {
		key = first;
		signal = third;
		value = second as Function;
	} else if (typeof first === 'function') {
		signal = second;
		value = first;
	}

	if (typeof value !== 'function') {
		throw new Error();
	}

	return getSubscription({
		key,
		subscriptions,
		value,
		property: colorSubscription,
		signal: signal instanceof AbortSignal ? signal : undefined,
	});
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
