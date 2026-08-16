import {formatHslColor, formatHwbColor, formatRgbColor} from './misc';
import {getAlpha} from './misc/alpha';
import {getColorState, setHexColor, setHSLColor, setHWBColor, setRGBColor} from './misc/state';
import type {
	ColorState,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from './models';

// #region Types

/**
 * A color that is represented in multiple color formats
 */
export class Color {
	/**
	 * A property to identify this as a Color instance, used for type checking
	 *
	 * @internal
	 */
	declare private readonly $color: boolean;

	readonly #state: ColorState;

	/**
	 * Get the alpha channel _(opacity)_ of the color as a percentage between `0` and `100`
	 *
	 * @returns Current alpha channel value
	 */
	get alpha(): number {
		return this.#state.alpha.value;
	}

	/**
	 * Set the alpha channel _(opacity)_ of the color as a percentage between `0` and `100`
	 *
	 * @param value New alpha channel value
	 */
	set alpha(value: number) {
		if (typeof value === 'number' && !Number.isNaN(value)) {
			this.#state.alpha = getAlpha(value);
		}
	}

	/**
	 * Get the color as a hex color string
	 *
	 * _Hex color string is returned with no `#`-prefix or alpha channel (opacity)_
	 *
	 * @returns Current color as a hex color string
	 */
	get hex(): string {
		return this.#state.hex;
	}

	/**
	 * Set the color from a hex color string
	 *
	 * - `#`-prefix is optional
	 * - Alpha channel _(opacity)_ will be ignored
	 *
	 * @param value New hex color string
	 */
	set hex(value: string) {
		setHexColor(this.#state, value, false);
	}

	/**
	 * Get the color as a hex color with an alpha channel _(opacity)_
	 *
	 * _Hex color string is returned with alpha channel (opacity), but without `#`-prefix_
	 *
	 * @returns Current color as a hex color string
	 */
	get hexa(): string {
		return `${this.#state.hex}${this.#state.alpha.hex}`;
	}

	/**
	 * Set the color from a hex color string with an alpha channel _(opacity)_
	 *
	 * - `#`-prefix is optional
	 * - Alpha channel _(opacity)_ will be respected
	 *
	 * @param value New hex color string
	 */
	set hexa(value: string) {
		setHexColor(this.#state, value, true);
	}

	/**
	 * Get the color as an _HSL_ color
	 *
	 * @returns Current color as an _HSL_ color
	 */
	get hsl(): HSLColor {
		return {...this.#state.hsl};
	}

	/**
	 * Set colors from an _HSL_ color
	 *
	 * @param value New _HSL_ color
	 */
	set hsl(value: HSLColor) {
		setHSLColor(this.#state, value, false);
	}

	/**
	 * Get the color as an _HSLA_ color
	 *
	 * @returns Current color as an _HSLA_ color
	 */
	get hsla(): HSLAColor {
		return {
			...this.#state.hsl,
			alpha: this.#state.alpha.value,
		};
	}

	/**
	 * Set colors and alpha from an _HSLA_ color
	 *
	 * @param value New _HSLA_ color
	 */
	set hsla(value: HSLAColor) {
		setHSLColor(this.#state, value, true);
	}

	/**
	 * Get the color as an _HWB_ color
	 *
	 * @returns Current color as an _HWB_ color
	 */
	get hwb(): HWBColor {
		return {...this.#state.hwb};
	}

	/**
	 * Set colors from an _HWB_ color
	 *
	 * @param value New _HWB_ color
	 */
	set hwb(value: HWBColor) {
		setHWBColor(this.#state, value, false);
	}

	/**
	 * Get the color as an _HWBA_ color
	 *
	 * @returns Current color as an _HWBA_ color
	 */
	get hwba(): HWBAColor {
		return {
			...this.#state.hwb,
			alpha: this.#state.alpha.value,
		};
	}

	/**
	 * Set colors and alpha from an _HWBA_ color
	 *
	 * @param value New _HWBA_ color
	 */
	set hwba(value: HWBAColor) {
		setHWBColor(this.#state, value, true);
	}

	/**
	 * Get the color as an _RGB_ color
	 *
	 * @returns Current color as an _RGB_ color
	 */
	get rgb(): RGBColor {
		return {...this.#state.rgb};
	}

	/**
	 * Set colors from an _RGB_ color
	 *
	 * @param value New _RGB_ color
	 */
	set rgb(value: RGBColor) {
		setRGBColor(this.#state, value, false);
	}

	/**
	 * Get the color as an _RGBA_ color
	 *
	 * @returns Current color as an _RGBA_ color
	 */
	get rgba(): RGBAColor {
		return {
			...this.#state.rgb,
			alpha: this.#state.alpha.value,
		};
	}

	/**
	 * Set colors and alpha from an _RGBA_ color
	 *
	 * @param value New _RGBA_ color
	 */
	set rgba(value: RGBAColor) {
		setRGBColor(this.#state, value, true);
	}

	constructor(value: unknown) {
		this.#state = getColorState(value);

		Object.defineProperty(this, '$color', {
			value: true,
		});
	}

	/**
	 * Get the color as a hex string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns Hex color string
	 */
	toHexString(alpha?: boolean): string {
		return `#${alpha === true ? this.hexa : this.hex}`;
	}

	/**
	 * Get the color as an _HSL(A)_ string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns _HSL(A)_ color string
	 */
	toHslString(alpha?: boolean): string {
		return formatHslColor(this, alpha === true);
	}

	/**
	 * Get the color as an _HWB(A)_ string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns _HWB(A)_ color string
	 */
	toHwbString(alpha?: boolean): string {
		return formatHwbColor(this, alpha === true);
	}

	/**
	 * Get the color as an _RGB(A)_ string
	 *
	 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
	 * @returns _RGB(A)_ color string
	 */
	toRgbString(alpha?: boolean): string {
		return formatRgbColor(this, alpha === true);
	}

	/**
	 * Get the color as a hex color string
	 *
	 * @returns Hex color string
	 */
	toString(): string {
		return this.toHexString();
	}
}

// #endregion
