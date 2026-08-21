import {formatHslColor, formatHwbColor, formatRgbColor} from './misc';
import {getAlpha} from './misc/alpha';
import {getColorState, setHexColor, setHSLColor, setHWBColor, setRGBColor} from './misc/state';
import type {Color, ColorState} from './models';

// #region Types

export function color(value: unknown): Color {
	const state = getColorState(value);

	const instance = {
		toHexString: (alpha?: boolean) =>
			`#${alpha === true ? (instance as Color).hexa : (instance as Color).hex}`,
		toHslString: (alpha?: boolean) => formatHslColor(state, alpha === true),
		toHwbString: (alpha?: boolean) => formatHwbColor(state, alpha === true),
		toRgbString: (alpha?: boolean) => formatRgbColor(state, alpha === true),
		toString: () => (instance as Color).toHexString(),
	};

	Object.defineProperties(instance, {
		$color: {
			enumerable: false,
			get: () => true,
		},
		alpha: {
			enumerable: true,
			get: () => state.alpha.value,
			set: (value: number) => {
				if (typeof value === 'number' && !Number.isNaN(value)) {
					state.alpha = getAlpha(value);
				}
			},
		},
		hex: getProperty('hex', state, false),
		hexa: getProperty('hex', state, true),
		hsl: getProperty('hsl', state, false),
		hsla: getProperty('hsl', state, true),
		hwb: getProperty('hwb', state, false),
		hwba: getProperty('hwb', state, true),
		rgb: getProperty('rgb', state, false),
		rgba: getProperty('rgb', state, true),
	});

	return Object.freeze(instance) as Color;
}

function getHex(state: ColorState, alpha: boolean): string {
	return alpha ? `${state.hex}${state.alpha.hex}` : state.hex;
}

function getProperty(
	space: keyof typeof setters,
	state: ColorState,
	alpha: boolean,
): PropertyDescriptor {
	const setter = setters[space];

	return {
		enumerable: true,
		get: () => {
			const value = state[space];

			if (typeof value === 'string') {
				return getHex(state, alpha);
			}

			return alpha
				? {
						...value,
						alpha: state.alpha.value,
					}
				: {...value};
		},
		set: (value: unknown) => {
			setter(state, value, alpha);
		},
	};
}

// #endregion

// #region Variables

const setters: Record<
	'hex' | 'hsl' | 'hwb' | 'rgb',
	(state: ColorState, value: any, alpha: boolean) => void
> = {
	hex: setHexColor,
	hsl: setHSLColor,
	hwb: setHWBColor,
	rgb: setRGBColor,
};

// #endregion
