import {expect, test} from 'vitest';
import {
	getColor,
	getForegroundColor,
	getHexaColor,
	getHexColor,
	getHslaColor,
	getHslColor,
	getNormalizedHex,
	getRandomItem,
	getRgbaColor,
	getRgbColor,
	isColor,
	round,
} from '../../src';
import {getHwbaColor, getHwbColor} from '../../src/color/misc/get';
import {colorFixture} from '../.fixtures/color.fixture';

const {foregrounds, hexes, hsls, hslas, hwbs, hwbas, instances, rgbas, rgbs, shorts} = colorFixture;
const {length} = hexes;

function roundColor(value: number): number {
	// Often a precision loss when converting colors,
	// so we round the values to 4 decimal places for comparison,
	// which should be acceptable decimal precision for color values

	return round(value, 4);
}

function roundColors<Values extends Record<string, number>>(values: Values): Values {
	const keys = Object.keys(values) as (keyof Values)[];
	const {length} = keys;

	const copy: Partial<Values> = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		copy[key] = roundColor(values[key]) as never;
	}

	return copy as Values;
}

test('getColor + isColor', () => {
	const indices = Array.from({length}).map((_, index) => index);

	for (let index = 0; index < length; index += 1) {
		const color = getColor(hexes[index]);

		const hsl = roundColors(hsls[index]);
		const hwb = roundColors(hwbs[index]);

		expect(color.hex).toEqual(hexes[index]);
		expect(roundColors(color.hsl)).toEqual(hsl);
		expect(roundColors(color.hsla)).toEqual({...hsl, alpha: 100});
		expect(roundColors(color.hwb)).toEqual(roundColors(hwb));
		expect(roundColors(color.hwba)).toEqual({...hwb, alpha: 100});
		expect(color.rgb).toEqual(rgbs[index]);
		expect(color.rgba).toEqual({...rgbs[index], alpha: 100});
		expect(color.alpha).toBe(100);

		let next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			expect(color.origin).toBe('hex');

			color.hex = hexes[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hex).toEqual(hexes[next]);
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(color.rgb).toEqual(rgbs[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			expect(color.origin).toBe('hex');

			color.hsl = hsls[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hex).toEqual(hexes[next]);
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(color.rgb).toEqual(rgbs[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			expect(color.origin).toBe('hsl');

			color.hwb = hwbs[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hex).toEqual(hexes[next]);
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(color.rgb).toEqual(rgbs[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		if (next != null) {
			expect(color.origin).toBe('hwb');

			color.rgb = rgbs[next];

			expect(color.origin).toBe('rgb');
			expect(color.hex).toEqual(hexes[next]);
			expect(color.hex).toEqual(hexes[next]);
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hsl)).toEqual(roundColors(hsls[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(roundColors(color.hwb)).toEqual(roundColors(hwbs[next]));
			expect(color.rgb).toEqual(rgbs[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}
	}

	const values = [...hexes, ...hsls, ...rgbs, true, 123, BigInt(123), {}, [], () => {}];

	const valuesLength = values.length;

	for (let index = 0; index < valuesLength; index += 1) {
		const value = values[index];
		const color = getColor(value);

		expect(isColor(color)).toBe(true);
		expect(isColor(value)).toBe(false);
	}

	const first = getColor(null);
	const second = getColor(first);

	expect(first).toBe(second);
});

test('getForegroundColor', () => {
	for (let index = 0; index < length; index += 1) {
		const foreground = foregrounds[index];

		expect(getForegroundColor(hexes[index]).hex).toBe(foreground);
		expect(getForegroundColor(hslas[index]).hex).toBe(foreground);
		expect(getForegroundColor(hsls[index]).hex).toBe(foreground);
		expect(getForegroundColor(hwbas[index]).hex).toBe(foreground);
		expect(getForegroundColor(hwbs[index]).hex).toBe(foreground);
		expect(getForegroundColor(rgbas[index]).hex).toBe(foreground);
		expect(getForegroundColor(rgbs[index]).hex).toBe(foreground);

		expect(getForegroundColor(hexes[index], true)).toBe(foreground);
		expect(getForegroundColor(hslas[index], true)).toBe(foreground);
		expect(getForegroundColor(hsls[index], true)).toBe(foreground);
		expect(getForegroundColor(hwbas[index], true)).toBe(foreground);
		expect(getForegroundColor(hwbs[index], true)).toBe(foreground);
		expect(getForegroundColor(rgbas[index], true)).toBe(foreground);
		expect(getForegroundColor(rgbs[index], true)).toBe(foreground);
	}

	const white = 'ffffff';

	expect(getForegroundColor('invalid').hex).toBe(white);
	expect(getForegroundColor('invalid', true)).toBe(white);
	expect(getForegroundColor(123).hex).toBe(white);
	expect(getForegroundColor(123, true)).toBe(white);
});

test('getHex(a)Color', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];

		expect(getHexColor(hex)).toEqual(hex);
		expect(getHexaColor(hex)).toEqual(`${hex}ff`);
	}

	const short = hexes.map(hex => `${hex.slice(0, 1)}${hex.slice(2, 3)}${hex.slice(4, 5)}`);

	const long = short.map(
		hex => `${hex.slice(0, 1).repeat(2)}${hex.slice(1, 2).repeat(2)}${hex.slice(2, 3).repeat(2)}`,
	);

	for (let index = 0; index < length; index += 1) {
		const longHex = long[index];
		const shortHex = short[index];

		expect(getHexColor(shortHex)).toEqual(longHex);
		expect(getHexaColor(shortHex)).toEqual(`${longHex}ff`);
	}

	expect(getHexColor('invalid')).toBe('000000');
	expect(getHexaColor('invalid')).toBe('000000ff');
});

test('getHslaColor', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = roundColors(hsls[index]);
		const hsla = roundColors(hslas[index]);

		expect(roundColors(getHslaColor(hexes[index]))).toEqual({...hsl, alpha: 100});
		expect(roundColors(getHslaColor(hsl))).toEqual({...hsl, alpha: 100});
		expect(roundColors(getHslaColor(hsla))).toEqual(hsla);
		expect(roundColors(getHslaColor(instances[index]))).toEqual({...hsl, alpha: 100});
		expect(roundColors(getHslaColor(rgbs[index]))).toEqual({...hsl, alpha: 100});
		expect(roundColors(getHslaColor(rgbas[index]))).toEqual({...hsl, alpha: hsla.alpha});
	}
});

test('getHslColor', () => {
	for (let index = 0; index < length; index += 1) {
		const {hue, lightness, saturation} = hsls[index];

		const hsl = getHslColor(hsls[index]);

		expect(roundColor(hsl.hue)).toBe(roundColor(hue));
		expect(roundColor(hsl.lightness)).toBe(roundColor(lightness));
		expect(roundColor(hsl.saturation)).toBe(roundColor(saturation));
	}
});

test('getHwbaColor', () => {
	for (let index = 0; index < length; index += 1) {
		const hwb = roundColors(hwbs[index]);
		const hwba = roundColors(hwbas[index]);

		expect(roundColors(getHwbaColor(hexes[index]))).toEqual({...hwb, alpha: 100});
		expect(roundColors(getHwbaColor(hwb))).toEqual({...hwb, alpha: 100});
		expect(roundColors(getHwbaColor(hwba))).toEqual(hwba);
		expect(roundColors(getHwbaColor(instances[index]))).toEqual({...hwb, alpha: 100});
		expect(roundColors(getHwbaColor(rgbs[index]))).toEqual({...hwb, alpha: 100});
		expect(roundColors(getHwbaColor(rgbas[index]))).toEqual({...hwb, alpha: hwba.alpha});
	}
});

test('getHwbColor', () => {
	for (let index = 0; index < length; index += 1) {
		const {hue, whiteness, blackness} = hwbs[index];

		const hwb = getHwbColor(hwbs[index]);

		expect(roundColor(hwb.hue)).toBe(roundColor(hue));
		expect(roundColor(hwb.whiteness)).toBe(roundColor(whiteness));
		expect(roundColor(hwb.blackness)).toBe(roundColor(blackness));
	}

	const {hex} = getColor({hue: 0, whiteness: 75, blackness: 75});

	expect(hex).toBe('808080');
});

test('getNormalizedHex', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];

		expect(getNormalizedHex(hex)).toEqual(hex);
		expect(getNormalizedHex(hex, true)).toEqual(`${hex}ff`);

		const short = shorts[index];
		const long = short
			.split('')
			.map(character => character.repeat(2))
			.join('');

		expect(getNormalizedHex(short)).toEqual(long);
		expect(getNormalizedHex(short, true)).toEqual(`${long}ff`);
	}

	const values = [...hsls, ...rgbs, true, 123, BigInt(123), {}, [], () => {}];

	const valuesLength = values.length;

	for (let index = 0; index < valuesLength; index += 1) {
		expect(getNormalizedHex(values[index])).toEqual('000000');
	}
});

test('getRgbaColor', () => {
	for (let index = 0; index < length; index += 1) {
		const rgb = rgbs[index];
		const rgba = rgbas[index];

		expect(getRgbaColor(hexes[index])).toEqual({...rgb, alpha: 100});
		expect(getRgbaColor(instances[index])).toEqual({...rgb, alpha: 100});
		expect(getRgbaColor(rgb)).toEqual({...rgb, alpha: 100});
		expect(getRgbaColor(rgba)).toEqual(rgba);
		expect(getRgbaColor(rgbs[index])).toEqual({...rgb, alpha: 100});
		expect(getRgbaColor(rgbas[index])).toEqual({...rgb, alpha: rgba.alpha});
	}
});

test('getRgbColor', () => {
	for (let index = 0; index < length; index += 1) {
		const {blue, green, red} = rgbs[index];

		const rgb = getRgbColor(rgbs[index]);

		expect(rgb.blue).toBe(blue);
		expect(rgb.green).toBe(green);
		expect(rgb.red).toBe(red);
	}
});
