import type {ColorState} from '../models';

// #region Functions

export function formatHslColor(state: ColorState, alpha: boolean): string {
	const {hue, lightness, saturation} = state.hsl;

	const suffix = alpha ? ` / ${state.alpha.value}%` : '';

	return `hsl(${hue}deg ${saturation}% ${lightness}%${suffix})`;
}

export function formatHwbColor(state: ColorState, alpha: boolean): string {
	const {blackness, hue, whiteness} = state.hwb;

	const suffix = alpha ? ` / ${state.alpha.value}%` : '';

	return `hwb(${hue}deg ${whiteness}% ${blackness}%${suffix})`;
}

export function formatRgbColor(state: ColorState, alpha: boolean): string {
	const {blue, green, red} = state.rgb;

	const suffix = alpha ? ` / ${state.alpha.value}%` : '';

	return `rgb(${red} ${green} ${blue}${suffix})`;
}

// #endregion
