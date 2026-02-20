import {expect, test} from 'vitest';
import {colorFixture} from '../.fixtures/color.fixture';
import {
	getColor,
	getForegroundColor,
	getHexaColor,
	getHexColor,
	getHslaColor,
	getHslColor,
	getNormalizedHex,
	getRgbaColor,
	getRgbColor,
	isColor,
} from '../../src/color';
import {getRandomItem} from '../../src/random';

const {foregrounds, hexes, hsls, hslas, instances, rgbas, rgbs, shorts} = colorFixture;
const {length} = hexes;

test('getColor + isColor', () => {
	const indices = Array.from({length}).map((_, index) => index);

	for (let index = 0; index < length; index += 1) {
		const color = getColor(hexes[index]);

		expect(color.hex).toEqual(hexes[index]);
		expect(color.hsl).toEqual(hsls[index]);
		expect(color.hsla).toEqual({...hsls[index], alpha: 1});
		expect(color.rgb).toEqual(rgbs[index]);
		expect(color.rgba).toEqual({...rgbs[index], alpha: 1});

		let next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			color.hex = hexes[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hsl).toEqual(hsls[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			color.hsl = hsls[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hsl).toEqual(hsls[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			color.rgb = rgbs[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hsl).toEqual(hsls[next]);
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
		expect(getForegroundColor(rgbs[index]).hex).toBe(foregrounds[index]);
	}
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
		const hsl = hsls[index];
		const hsla = hslas[index];

		expect(getHslaColor(hexes[index])).toEqual({...hsl, alpha: 1});
		expect(getHslaColor(hsl)).toEqual({...hsl, alpha: 1});
		expect(getHslaColor(hsla)).toEqual(hsla);
		expect(getHslaColor(instances[index])).toEqual({...hsl, alpha: 1});
		expect(getHslaColor(rgbs[index])).toEqual({...hsl, alpha: 1});
		expect(getHslaColor(rgbas[index])).toEqual({...hsl, alpha: hsla.alpha});
	}
});

test('getHslColor', () => {
	for (let index = 0; index < length; index += 1) {
		const {hue, lightness, saturation} = hsls[index];

		const hsl = getHslColor(hsls[index]);

		expect(hsl.hue).toBe(hue);
		expect(hsl.lightness).toBe(lightness);
		expect(hsl.saturation).toBe(saturation);
	}
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

		expect(getRgbaColor(hexes[index])).toEqual({...rgb, alpha: 1});
		expect(getRgbaColor(instances[index])).toEqual({...rgb, alpha: 1});
		expect(getRgbaColor(rgb)).toEqual({...rgb, alpha: 1});
		expect(getRgbaColor(rgba)).toEqual(rgba);
		expect(getRgbaColor(rgbs[index])).toEqual({...rgb, alpha: 1});
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
