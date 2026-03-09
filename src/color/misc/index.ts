import {join} from '../../internal/string';
import {KEYS_HSL, KEYS_RGB} from '../constants';
import type {Color} from '../instance';
import type {ColorProperty, ColorSpace} from '../models';

// #region Functions

export function formatColor(space: ColorSpace, color: Color, alpha: boolean): string {
	const suffix = alpha ? ` / ${color.alpha}` : '';
	const value = color[space];

	return `${space}(${join(
		keys[space].map(key => value[key as never]),
		SPACE,
	)}${suffix})`;
}

// #endregion

// #region Variables

const SPACE = ' ';

const keys: Record<ColorSpace, ColorProperty[]> = {
	hsl: KEYS_HSL,
	rgb: KEYS_RGB,
};

// #endregion
