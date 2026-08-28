import type {HeraldEvents} from '../herald';
import type {Subscription} from '../internal/subscription';
import type {COLOR_ALPHA} from './constants';

// #region Types

export type Alpha = {
	hex: string;
	value: number;
};

/**
 * A color that is represented in multiple color formats
 */
export type Color = {
	/**
	 *
	 */
	readonly changes: HeraldEvents<ColorChanges>;

	/**
	 * Get the alpha channel _(opacity)_ of the color as a percentage between `0` and `100`
	 *
	 * @returns Current alpha channel value
	 */
	get alpha(): number;

	/**
	 * Set the alpha channel _(opacity)_ of the color as a percentage between `0` and `100`
	 *
	 * @param value New alpha channel value
	 */
	set alpha(value: number);

	/**
	 * Get the color as a hex color string
	 *
	 * _Hex color string is returned with no `#`-prefix or alpha channel (opacity)_
	 *
	 * @returns Current color as a hex color string
	 */
	get hex(): string;

	/**
	 * Set the color from a hex color string
	 *
	 * - `#`-prefix is optional
	 * - Alpha channel _(opacity)_ will be ignored
	 *
	 * @param value New hex color string
	 */
	set hex(value: string);

	/**
	 * Get the color as a hex color with an alpha channel _(opacity)_
	 *
	 * _Hex color string is returned with alpha channel (opacity), but without `#`-prefix_
	 *
	 * @returns Current color as a hex color string
	 */
	get hexa(): string;

	/**
	 * Set the color from a hex color string with an alpha channel _(opacity)_
	 *
	 * - `#`-prefix is optional
	 * - Alpha channel _(opacity)_ will be respected
	 *
	 * @param value New hex color string
	 */
	set hexa(value: string);

	/**
	 * Get the color as an _HSL_ color
	 *
	 * @returns Current color as an _HSL_ color
	 */
	get hsl(): HSLColor;

	/**
	 * Set colors from an _HSL_ color
	 *
	 * @param value New _HSL_ color
	 */
	set hsl(value: HSLColor);

	/**
	 * Get the color as an _HSLA_ color
	 *
	 * @returns Current color as an _HSLA_ color
	 */
	get hsla(): HSLAColor;

	/**
	 * Set colors and alpha from an _HSLA_ color
	 *
	 * @param value New _HSLA_ color
	 */
	set hsla(value: HSLAColor);

	/**
	 * Get the color as an _HWB_ color
	 *
	 * @returns Current color as an _HWB_ color
	 */
	get hwb(): HWBColor;

	/**
	 * Set colors from an _HWB_ color
	 *
	 * @param value New _HWB_ color
	 */
	set hwb(value: HWBColor);

	/**
	 * Get the color as an _HWBA_ color
	 *
	 * @returns Current color as an _HWBA_ color
	 */
	get hwba(): HWBAColor;

	/**
	 * Set colors and alpha from an _HWBA_ color
	 *
	 * @param value New _HWBA_ color
	 */
	set hwba(value: HWBAColor);

	/**
	 * Last color format that was set on the color
	 *
	 * @returns Color type
	 */
	get origin(): ColorType;

	/**
	 * Get the color as an _RGB_ color
	 *
	 * @returns Current color as an _RGB_ color
	 */
	get rgb(): RGBColor;

	/**
	 * Set colors from an _RGB_ color
	 *
	 * @param value New _RGB_ color
	 */
	set rgb(value: RGBColor);

	/**
	 * Get the color as an _RGBA_ color
	 *
	 * @returns Current color as an _RGBA_ color
	 */
	get rgba(): RGBAColor;

	/**
	 * Set colors and alpha from an _RGBA_ color
	 *
	 * @param value New _RGBA_ color
	 */
	set rgba(value: RGBAColor);

	/**
	 * Subscribe to value changes for the color
	 *
	 * @param callback Callback function
	 * @param signal Optional abort signal to cancel the subscription
	 */
	subscribe(callback: (value: Color) => void, signal?: AbortSignal): Subscription;

	/**
	 * Get the color as a hex string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns Hex color string
	 */
	toHexString(alpha?: boolean): string;

	/**
	 * Get the color as an _HSL(A)_ string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns _HSL(A)_ color string
	 */
	toHslString(alpha?: boolean): string;

	/**
	 * Get the color as an _HWB(A)_ string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns _HWB(A)_ color string
	 */
	toHwbString(alpha?: boolean): string;

	/**
	 * Get the color as an _RGB(A)_ string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns _RGB(A)_ color string
	 */
	toRgbString(alpha?: boolean): string;

	/**
	 * Get the color as a hex color string
	 *
	 * @returns Hex color string
	 */
	toString(): string;

	/**
	 * Unsubscribe from all color changes of the color
	 *
	 * _(To unsubscribe from a specific color change, use the `unsubscribe()` method on the `Subscription` returned by the individual `subscribe()` method)_
	 */
	unsubscribe(): void;
};

export type ColorChanges = {
	'*': (value: Color) => void;
	alpha: (value: number) => void;
	hex: (value: string) => void;
	hexa: (value: string) => void;
	hsl: (value: HSLColor) => void;
	hsla: (value: HSLAColor) => void;
	hwb: (value: HWBColor) => void;
	hwba: (value: HWBAColor) => void;
	rgb: (value: RGBColor) => void;
	rgba: (value: RGBAColor) => void;
};

type ColorWithAlpha = {
	/**
	 * Alpha channel _(opacity)_ of the color _(in percentage; 0-100)_
	 */
	alpha: number;
};

/**
 * An _HSL_ color with an alpha channel _(opacity)_
 */
export type HSLAColor = HSLColor & ColorWithAlpha;

/**
 * An _HSL_ color
 */
export type HSLColor = {
	/**
	 * Hue of the color _(in degrees; 0-360)_
	 */
	hue: number;
	/**
	 * Lightness of the color _(in percentage; 0-100)_
	 */
	lightness: number;
	/**
	 * Saturation of the color _(in percentage; 0-100)_
	 */
	saturation: number;
};

export type HWBColor = {
	/**
	 * Blackness of the color _(in percentage; 0-100)_
	 */
	blackness: number;
	/**
	 * Hue of the color _(in degrees; 0-360)_
	 */
	hue: number;
	/**
	 * Whiteness of the color _(in percentage; 0-100)_
	 */
	whiteness: number;
};

export type HWBAColor = HWBColor & ColorWithAlpha;

/**
 * An _RGB_ color with an alpha channel _(opacity)_
 */
export type RGBAColor = RGBColor & ColorWithAlpha;

/**
 * An _RGB_ color
 */
export type RGBColor = {
	/**
	 * Blue channel of the color _(in hexadecimal; 0-255)_
	 */
	blue: number;
	/**
	 * Green channel of the color _(in hexadecimal; 0-255)_
	 */
	green: number;
	/**
	 * Red channel of the color _(in hexadecimal; 0-255)_
	 */
	red: number;
};

export type ColorProperty =
	| typeof COLOR_ALPHA.name
	| keyof HSLColor
	| keyof HWBColor
	| keyof RGBColor;

export type ColorState = {
	alpha: Alpha;
	hex?: string;
	hsl?: HSLColor;
	hwb?: HWBColor;
	origin: ColorType;
	rgb?: RGBColor;
};

/**
 * Base color types
 */
export type ColorType = 'hex' | 'hsl' | 'hwb' | 'rgb';

/**
 * Extended color types
 */
export type ColorTypeExtended = ColorType | 'hsla' | 'hwba' | 'rgba';

/**
 * Base color values
 */
export type ColorValue = string | HSLColor | HWBColor | RGBColor;

/**
 * Extended color values
 */
export type ColorValueExtended = ColorValue | HSLAColor | HWBAColor | RGBAColor;

// #endregion
