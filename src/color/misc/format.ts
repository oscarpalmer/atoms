import {COLOR_TYPE} from '../constants';
import type {ColorState} from '../models';
import {getColorFromState} from './state';

// #region Functions

export function formatHslColor(state: ColorState, alpha?: boolean): string {
	const {hue, lightness, saturation} = getColorFromState(state, COLOR_TYPE.hsl);

	return `hsl(${hue}deg ${saturation}% ${lightness}%${getSuffix(state, alpha)})`;
}

export function formatHwbColor(state: ColorState, alpha?: boolean): string {
	const {blackness, hue, whiteness} = getColorFromState(state, COLOR_TYPE.hwb);

	return `hwb(${hue}deg ${whiteness}% ${blackness}%${getSuffix(state, alpha)})`;
}

export function formatRgbColor(state: ColorState, alpha?: boolean): string {
	const {blue, green, red} = getColorFromState(state, COLOR_TYPE.rgb);

	return `rgb(${red} ${green} ${blue}${getSuffix(state, alpha)})`;
}

function getSuffix(state: ColorState, alpha?: boolean): string {
	return alpha === true ? ` / ${state.alpha.value}%` : '';
}

// #endregion
