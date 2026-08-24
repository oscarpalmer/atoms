import {TYPE_HSL, TYPE_HWB, TYPE_RGB} from '../constants';
import type {ColorState} from '../models';
import {getColorFromState} from './state';

// #region Functions

export function formatHslColor(state: ColorState, alpha?: boolean): string {
	const {hue, lightness, saturation} = getColorFromState(state, TYPE_HSL);

	return `hsl(${hue}deg ${saturation}% ${lightness}%${getSuffix(state, alpha)})`;
}

export function formatHwbColor(state: ColorState, alpha?: boolean): string {
	const {blackness, hue, whiteness} = getColorFromState(state, TYPE_HWB);

	return `hwb(${hue}deg ${whiteness}% ${blackness}%${getSuffix(state, alpha)})`;
}

export function formatRgbColor(state: ColorState, alpha?: boolean): string {
	const {blue, green, red} = getColorFromState(state, TYPE_RGB);

	return `rgb(${red} ${green} ${blue}${getSuffix(state, alpha)})`;
}

function getSuffix(state: ColorState, alpha?: boolean): string {
	return alpha === true ? ` / ${state.alpha.value}%` : '';
}

// #endregion
