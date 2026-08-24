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
		subscribe: (first?: unknown, second?: unknown) =>
			subscribeToColor(subscriptions, first, second),
		toHexString: (alpha?: boolean) =>
			`#${alpha === true ? (instance as Color).hexa : (instance as Color).hex}`,
		toHslString: (alpha?: boolean) => formatHslColor(state, alpha),
		toHwbString: (alpha?: boolean) => formatHwbColor(state, alpha),
		toRgbString: (alpha?: boolean) => formatRgbColor(state, alpha),
		toString: () => (instance as Color).toHexString(),
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
		hex: getProperty(COLOR_TYPE.hex, instance as Color, state, subscriptions, false),
		hexa: getProperty(COLOR_TYPE.hex, instance as Color, state, subscriptions, true),
		hsl: getProperty(COLOR_TYPE.hsl, instance as Color, state, subscriptions, false),
		hsla: getProperty(COLOR_TYPE.hsl, instance as Color, state, subscriptions, true),
		hwb: getProperty(COLOR_TYPE.hwb, instance as Color, state, subscriptions, false),
		hwba: getProperty(COLOR_TYPE.hwb, instance as Color, state, subscriptions, true),
		origin: {
			enumerable: true,
			get: () => state.origin,
		},
		rgb: getProperty(COLOR_TYPE.rgb, instance as Color, state, subscriptions, false),
		rgba: getProperty(COLOR_TYPE.rgb, instance as Color, state, subscriptions, true),
	});

	return Object.freeze(instance) as Color;
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
): Subscription {
	let key: string | undefined;
	let value: Function | undefined;

	if (typeof first === 'string') {
		key = first;
		value = second as Function;
	} else if (typeof first === 'function') {
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
	});
}

// #endregion

// #region Variables

const colorSubscription: SubscriptionProperty = {
	key: COLOR_PROPERTY.name,
	value: COLOR_PROPERTY.subscription,
};

const setters: SetValues = {
	hex: setHexColor,
	hsl: setHSLColor,
	hwb: setHWBColor,
	rgb: setRGBColor,
};

// #endregion
