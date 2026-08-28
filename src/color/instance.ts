import {
	createSubscriptions,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from '../internal/subscription';
import type {GenericCallback, Key} from '../models';
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

	const subscriptions = createSubscriptions<Function>(COLOR_TYPE.all);

	const instance: unknown = {
		subscribe: (first?: never, second?: never, third?: never) =>
			subscribeToColor(instance as Color, subscriptions, first, second, third),
		toHexString: (alpha?: never) => formatHexColor(instance as Color, alpha),
		toHslString: (alpha?: never) => formatHslColor(state, alpha),
		toHwbString: (alpha?: never) => formatHwbColor(state, alpha),
		toRgbString: (alpha?: never) => formatRgbColor(state, alpha),
		toString: () => (instance as Color).toHexString(),
		unsubscribe: () => subscriptions.clear(),
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
	color: Color,
	subscriptions: Subscriptions,
	first: unknown,
	second?: unknown,
	third?: unknown,
): Subscription {
	const signal = third ?? second;

	let key: Key | undefined;
	let callback: GenericCallback;

	if (second == null) {
		callback = first as GenericCallback;
	} else {
		key = first as Key;
		callback = second as GenericCallback;
	}

	const [subscription, existing] = subscriptions.create({
		key,
		property: colorSubscription,
		signal: signal instanceof AbortSignal ? signal : undefined,
		value: callback,
	});

	if (existing) {
		return subscription;
	}

	if (key == null) {
		callback(color);
	} else {
		callback(color[key as keyof Color]);
	}

	return subscription;
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
