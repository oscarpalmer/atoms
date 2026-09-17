import {herald} from '../internal/herald';
import {type Subscription} from '../internal/subscription';
import type {GenericCallback} from '../models';
import {COLOR_NAME, COLOR_PROPERTY, COLOR_SYMBOL, COLOR_TYPE, colorSubscription} from './constants';
import {getColorAlpha, setColorAlpha} from './misc/alpha';
import {formatHexColor, formatHslColor, formatHwbColor, formatRgbColor} from './misc/format';
import {getColorState} from './misc/state';
import type {Color, ColorChanges, ColorType, InternalColor} from './models';
import {getHexaColor, getHexColor, setHexaValue, setHexValue} from './space/hex';
import {getHslaValue, getHslValue, setHslaValue, setHslValue} from './space/hsl';
import {getHwbaValue, getHwbValue, setHwbaValue, setHwbValue} from './space/hwb';
import {getRgbaColor, getRgbColor, setRgbaValue, setRgbValue} from './space/rgb';

// #region Instances

function Color(this: any, value: unknown) {
	this[COLOR_SYMBOL] = {
		changes: herald<ColorChanges>({
			names: [COLOR_TYPE.wildcard, ...COLOR_TYPE.all],
			property: colorSubscription,
			onCreate: (event, callback) => onCreateSubscription(this, event, callback),
		}),
		values: getColorState(value),
	};
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
		get: getColorAlpha,
		set: setColorAlpha,
	},
	changes: {
		enumerable: true,
		get: getColorChanges,
	},
	hex: {
		enumerable: true,
		get: getHexColor,
		set: setHexValue,
	},
	hexa: {
		enumerable: true,
		get: getHexaColor,
		set: setHexaValue,
	},
	hsl: {
		enumerable: true,
		get: getHslValue,
		set: setHslValue,
	},
	hsla: {
		enumerable: true,
		get: getHslaValue,
		set: setHslaValue,
	},
	hwb: {
		enumerable: true,
		get: getHwbValue,
		set: setHwbValue,
	},
	hwba: {
		enumerable: true,
		get: getHwbaValue,
		set: setHwbaValue,
	},
	origin: {
		enumerable: true,
		get: getOrigin,
	},
	rgb: {
		enumerable: true,
		get: getRgbColor,
		set: setRgbValue,
	},
	rgba: {
		enumerable: true,
		get: getRgbaColor,
		set: setRgbaValue,
	},
});

// #endregion

// #region Functions

export function color(value: unknown): Color {
	// @ts-expect-error All good, no worries :-)
	return new Color(value);
}

function getColorChanges(this: InternalColor): Record<string, GenericCallback> {
	return this[COLOR_SYMBOL].changes.events;
}

function getOrigin(this: InternalColor): ColorType {
	return this[COLOR_SYMBOL].values.origin;
}

function onCreateSubscription(
	instance: Color,
	event: '*' | keyof Color,
	callback: GenericCallback,
): void {
	let value: unknown;

	if (event === COLOR_TYPE.wildcard) {
		value = instance;
	} else {
		value = instance[event];
	}

	callback(value);
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
