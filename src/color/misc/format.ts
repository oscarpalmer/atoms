import {COLOR_SYMBOL, COLOR_TYPE} from '../constants';
import type {ColorState, InternalColor} from '../models';
import {getColorFromState} from './state';

// #region Functions

export function formatHexColor(this: InternalColor, alpha?: boolean): string {
	return `#${alpha === true ? this.hexa : this.hex}`;
}

export function formatHslColor(this: InternalColor, alpha?: boolean): string {
	const {values} = this[COLOR_SYMBOL];

	const {hue, lightness, saturation} = getColorFromState(values, COLOR_TYPE.hsl);

	return `hsl(${hue}deg ${saturation}% ${lightness}%${getSuffix(values, alpha)})`;
}

export function formatHwbColor(this: InternalColor, alpha?: boolean): string {
	const {values} = this[COLOR_SYMBOL];

	const {blackness, hue, whiteness} = getColorFromState(values, COLOR_TYPE.hwb);

	return `hwb(${hue}deg ${whiteness}% ${blackness}%${getSuffix(values, alpha)})`;
}

export function formatRgbColor(this: InternalColor, alpha?: boolean): string {
	const {values} = this[COLOR_SYMBOL];

	const {blue, green, red} = getColorFromState(values, COLOR_TYPE.rgb);

	return `rgb(${red} ${green} ${blue}${getSuffix(values, alpha)})`;
}

function getSuffix(state: ColorState, alpha?: boolean): string {
	return alpha === true ? ` / ${state.alpha.value}%` : '';
}

// #endregion
