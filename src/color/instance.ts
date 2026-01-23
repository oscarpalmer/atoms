import {formatColor} from './misc';
import {getAlpha} from './misc/alpha';
import {getState, setHexColor, setHSLColor, setRGBColor} from './misc/state';
import type {ColorState, HSLAColor, HSLColor, RGBAColor, RGBColor} from './models';

// #region Classes

export class Color {
	declare private readonly $color: boolean;

	readonly #state: ColorState;

	/**
	 * Get the alpha channel
	 */
	get alpha(): number {
		return this.#state.alpha.value;
	}

	/**
	 * Set the alpha channel
	 */
	set alpha(value: number) {
		if (typeof value === 'number' && !Number.isNaN(value)) {
			this.#state.alpha = getAlpha(value);
		}
	}

	/**
	 * Get the color as a hex color
	 */
	get hex(): string {
		return this.#state.hex;
	}

	/**
	 * Set colors from a hex color
	 */
	set hex(value: string) {
		setHexColor(this.#state, value, false);
	}

	/**
	 * Get the color as a hex color with an alpha channel
	 */
	get hexa(): string {
		return `${this.#state.hex}${this.#state.alpha.hex}`;
	}

	/**
	 * Set colors and alpha from a hex color with an alpha channel
	 */
	set hexa(value: string) {
		setHexColor(this.#state, value, true);
	}

	/**
	 * Get the color as an HSL color
	 */
	get hsl(): HSLColor {
		return this.#state.hsl;
	}

	/**
	 * Set colors from an HSL color
	 */
	set hsl(value: HSLColor) {
		setHSLColor(this.#state, value, false);
	}

	/**
	 * Get the color as an HSLA color
	 */
	get hsla(): HSLAColor {
		return {
			...this.#state.hsl,
			alpha: this.#state.alpha.value,
		};
	}

	/**
	 * Set colors and alpha from an HSLA color
	 */
	set hsla(value: HSLAColor) {
		setHSLColor(this.#state, value, true);
	}

	/**
	 * Get the color as an RGB color
	 */
	get rgb(): RGBColor {
		return this.#state.rgb;
	}

	/**
	 * Set colors from an RGB color
	 */
	set rgb(value: RGBColor) {
		setRGBColor(this.#state, value, false);
	}

	/**
	 * Get the color as an RGBA color
	 */
	get rgba(): RGBAColor {
		return {
			...this.#state.rgb,
			alpha: this.#state.alpha.value,
		};
	}

	/**
	 * Set colors and alpha from an RGBA color
	 */
	set rgba(value: RGBAColor) {
		setRGBColor(this.#state, value, true);
	}

	constructor(value: unknown) {
		this.#state = getState(value);

		Object.defineProperty(this, '$color', {
			value: true,
		});
	}

	toHexString(alpha?: boolean): string {
		return `#${alpha === true ? this.hexa : this.hex}`;
	}

	toHslString(alpha?: boolean): string {
		return formatColor('hsl', this, alpha === true);
	}

	toRgbString(alpha?: boolean): string {
		return formatColor('rgb', this, alpha === true);
	}

	toString(): string {
		return this.toHexString();
	}
}

// #endregion
