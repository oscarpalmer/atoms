import {herald} from '../internal/herald';
import {type Subscription} from '../internal/subscription';
import type {GenericCallback} from '../models';
import {COLOR_NAME, COLOR_PROPERTY, COLOR_SYMBOL, COLOR_TYPE, colorSubscription} from './constants';
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
import type {
	Color,
	ColorChanges,
	ColorState,
	ColorType,
	InternalColor,
	InternalColorState,
} from './models';

// #region Instances

function Color(this: any, value: unknown) {
	this[COLOR_SYMBOL] = {
		changes: herald<ColorChanges>({
			names: [COLOR_TYPE.wildcard, ...COLOR_TYPE.all],
			property: colorSubscription,
			onCreate: (event, callback) => onCreateSubscription(this, event, callback),
		}),
		values: getColorState(value),
	} satisfies InternalColorState;
}

Color.prototype[COLOR_PROPERTY] = COLOR_NAME;

Color.prototype.subscribe = subscribeToColor;
Color.prototype.toHexString = formatHexColor;
Color.prototype.toHslString = formatHslColor;
Color.prototype.toHwbString = formatHwbColor;
Color.prototype.toRgbString = formatRgbColor;
Color.prototype.toString = formatHexColor;
Color.prototype.unsubscribe = unsubscribeFromColor;

Object.defineProperties(Color.prototype, {
	alpha: {
		enumerable: true,
		get(): number {
			return (this as InternalColor)[COLOR_SYMBOL].values.alpha.value;
		},
		set(value: never) {
			setAlphaValue((this as InternalColor)[COLOR_SYMBOL].values, value);
		},
	},
	changes: {
		enumerable: true,
		get(): Record<string, GenericCallback> {
			return (this as InternalColor)[COLOR_SYMBOL].changes.events;
		},
	},
	hex: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.hex, false);
		},
		set(value: string) {
			setHexColor(this, value, false);
		},
	},
	hexa: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.hex, true);
		},
		set(value: string) {
			setHexColor(this, value, true);
		},
	},
	hsl: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.hsl, false);
		},
		set(value: string) {
			setHSLColor(this, value, false);
		},
	},
	hsla: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.hsl, true);
		},
		set(value: string) {
			setHSLColor(this, value, true);
		},
	},
	hwb: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.hwb, false);
		},
		set(value: string) {
			setHWBColor(this, value, false);
		},
	},
	hwba: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.hwb, true);
		},
		set(value: string) {
			setHWBColor(this, value, true);
		},
	},
	origin: {
		enumerable: true,
		get(): ColorType {
			return (this as InternalColor)[COLOR_SYMBOL].values.origin;
		},
	},
	rgb: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.rgb, false);
		},
		set(value: string) {
			setRGBColor(this, value, false);
		},
	},
	rgba: {
		enumerable: true,
		get(): unknown {
			return getColorValue(this, COLOR_TYPE.rgb, true);
		},
		set(value: string) {
			setRGBColor(this, value, true);
		},
	},
});

// #endregion

// #region Functions

export function color(value: unknown): Color {
	// @ts-expect-error All good, no worries :-)
	return new Color(value);
}

function getColorValue(instance: InternalColor, type: ColorType, alpha: boolean) {
	const {values} = instance[COLOR_SYMBOL];

	const value = getColorFromState(values, type);

	if (typeof value === 'string') {
		return alpha ? `${value}${values.alpha.hex}` : value;
	}

	return alpha
		? {
				...value,
				alpha: values.alpha.value,
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

function subscribeToColor(
	this: InternalColor,
	callback: GenericCallback,
	signal?: AbortSignal,
): Subscription {
	const {changes} = this[COLOR_SYMBOL];

	return changes.subscribe(COLOR_TYPE.wildcard, callback, signal);
}

function unsubscribeFromColor(this: InternalColor): void {
	this[COLOR_SYMBOL].changes.clear();
}

// #endregion
