import {expect, test} from 'vitest';
import {
	getColor,
	getHexColor,
	getHslaColor,
	getHslColor,
	getRgbaColor,
	getRgbColor,
	isColor,
	isHexColor,
	isHslaColor,
	isHslColor,
	isHwbaColor,
	isHwbColor,
	isRgbaColor,
	isRgbColor,
} from '../../src';
import {getAlphaHexadecimal} from '../../src/color/misc/alpha';
import {getHwbaColor, getHwbColor} from '../../src/color/misc/get';
import {
	isHslaLike,
	isHslLike,
	isHwbaLike,
	isHwbLike,
	isRgbaLike,
	isRgbLike,
} from '../../src/color/misc/is';
import {colorFixture} from '../.fixtures/color.fixture';

const {alphas, hexes, hsls, hslas, is, rgbs} = colorFixture;
const {length} = hexes;

test('alpha', () => {
	const rgb = {
		red: 0,
		green: 0,
		blue: 0,
	};

	const a = getColor({
		...rgb,
		alpha: -100,
	});

	const b = getColor({
		...rgb,
		alpha: 1000,
	});

	const c = getColor({
		...rgb,
		alpha: '99',
	});

	const d = getColor({
		...rgb,
		alpha: 'hello, world!',
	});

	expect(a.alpha).toBe(0);
	expect(b.alpha).toBe(100);
	expect(c.alpha).toBe(99);
	expect(d.alpha).toBe(100);
});

test('formatting', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];
		const rgb = rgbs[index];

		const color = getColor(hslas[index]);

		expect(color.toString()).toBe(`#${hex}`);

		expect(color.toHexString()).toBe(`#${hex}`);
		expect(color.toHexString(true)).toBe(`#${hex}${getAlphaHexadecimal(alphas[index])}`);

		expect(color.toHslString()).toBe(`hsl(${hsl.hue}deg ${hsl.saturation}% ${hsl.lightness}%)`);

		expect(color.toHslString(true)).toBe(
			`hsl(${hsl.hue}deg ${hsl.saturation}% ${hsl.lightness}% / ${alphas[index]}%)`,
		);

		expect(color.toHwbString()).toBe(
			`hwb(${color.hwb.hue}deg ${color.hwb.whiteness}% ${color.hwb.blackness}%)`,
		);

		expect(color.toHwbString(true)).toBe(
			`hwb(${color.hwb.hue}deg ${color.hwb.whiteness}% ${color.hwb.blackness}% / ${
				alphas[index]
			}%)`,
		);

		expect(color.toRgbString()).toBe(`rgb(${rgb.red} ${rgb.green} ${rgb.blue})`);

		expect(color.toRgbString(true)).toBe(
			`rgb(${rgb.red} ${rgb.green} ${rgb.blue} / ${alphas[index]}%)`,
		);
	}
});

test('is', () => {
	const hex = getHexColor(hexes[0]);

	const hsl = getHslColor(hex);
	const hsla = getHslaColor(hex);

	const hwb = getHwbColor(hex);
	const hwba = getHwbaColor(hex);

	const rgb = getRgbColor(hex);
	const rgba = getRgbaColor(hex);

	for (const item of is) {
		const [value, alpha, expected] = item;

		expect(isHexColor(value, alpha)).toBe(expected);
		expect(isHexColor(`#${value}`, alpha)).toBe(expected);
	}

	expect(isHexColor(hex)).toBe(true);
	expect(isHexColor(hsl)).toBe(false);
	expect(isHexColor(rgb)).toBe(false);

	expect(isHslColor(hex)).toBe(false);
	expect(isHslColor(hsl)).toBe(true);
	expect(isHslColor(hsla)).toBe(true);
	expect(isHslColor({hello: 'world'})).toBe(false);
	expect(isHslColor({hue: 'x', lightness: 0, saturation: 0})).toBe(false);
	expect(isHslColor({hue: 900, lightness: 0, saturation: 0})).toBe(false);
	expect(isHslColor(rgb)).toBe(false);

	expect(isHslaColor(hex)).toBe(false);
	expect(isHslaColor(hsl)).toBe(false);
	expect(isHslaColor(hsla)).toBe(true);
	expect(isHslaColor({hello: 'world'})).toBe(false);
	expect(isHslaColor({hue: 'x', lightness: 0, saturation: 0})).toBe(false);
	expect(isHslaColor({hue: 900, lightness: 0, saturation: 0})).toBe(false);
	expect(isHslaColor(rgb)).toBe(false);

	expect(isHwbColor(hex)).toBe(false);
	expect(isHwbColor(hwb)).toBe(true);
	expect(isHwbColor(hwba)).toBe(true);
	expect(isHwbColor({hello: 'world'})).toBe(false);
	expect(isHwbColor({hue: 'x', whiteness: 0, blackness: 0})).toBe(false);
	expect(isHwbColor({hue: 900, whiteness: 0, blackness: 0})).toBe(false);
	expect(isHwbColor(rgb)).toBe(false);

	expect(isHwbaColor(hex)).toBe(false);
	expect(isHwbaColor(hwb)).toBe(false);
	expect(isHwbaColor(hwba)).toBe(true);
	expect(isHwbaColor({hello: 'world'})).toBe(false);
	expect(isHwbaColor({hue: 'x', whiteness: 0, blackness: 0})).toBe(false);
	expect(isHwbaColor({hue: 900, whiteness: 0, blackness: 0})).toBe(false);
	expect(isHwbaColor(rgb)).toBe(false);

	expect(isRgbColor(hex)).toBe(false);
	expect(isRgbColor(hsl)).toBe(false);
	expect(isRgbColor(rgb)).toBe(true);
	expect(isRgbColor(rgba)).toBe(true);
	expect(isRgbColor({hello: 'world'})).toBe(false);
	expect(isRgbColor({red: 'x', green: 0, blue: 0})).toBe(false);
	expect(isRgbColor({red: 900, green: 0, blue: 0})).toBe(false);

	expect(isRgbaColor(hex)).toBe(false);
	expect(isRgbaColor(hsl)).toBe(false);
	expect(isRgbaColor(rgb)).toBe(false);
	expect(isRgbaColor(rgba)).toBe(true);
	expect(isRgbaColor({hello: 'world'})).toBe(false);
	expect(isRgbaColor({red: 'x', green: 0, blue: 0})).toBe(false);
	expect(isRgbaColor({red: 900, green: 0, blue: 0})).toBe(false);

	expect(isColor(hex)).toBe(false);
	expect(isColor(hsl)).toBe(false);
	expect(isColor(rgb)).toBe(false);
});

test('isLike', () => {
	const hsl = {
		hue: 0,
		lightness: 0,
		saturation: 0,
	};

	const hsla = {
		...hsl,
		alpha: 0,
	};

	const hwb = {
		hue: 0,
		whiteness: 0,
		blackness: 0,
	};

	const hwba = {
		...hwb,
		alpha: 0,
	};

	const rgb = {
		red: 0,
		green: 0,
		blue: 0,
	};

	const rgba = {
		...rgb,
		alpha: 0,
	};

	expect(isHslLike(hsl)).toBe(true);
	expect(isHslLike({hue: 123})).toBe(false);
	expect(isHslLike(123)).toBe(false);
	expect(isHslLike(hwb)).toBe(false);
	expect(isHslLike(rgb)).toBe(false);

	expect(isHwbLike(hwb)).toBe(true);
	expect(isHwbLike({hue: 123})).toBe(false);
	expect(isHwbLike(123)).toBe(false);
	expect(isHwbLike(hsl)).toBe(false);
	expect(isHwbLike(rgb)).toBe(false);

	expect(isRgbLike(rgb)).toBe(true);
	expect(isRgbLike({red: 123})).toBe(false);
	expect(isRgbLike(123)).toBe(false);
	expect(isRgbLike(hsl)).toBe(false);
	expect(isRgbLike(hwb)).toBe(false);

	expect(isHslaLike(hsla)).toBe(true);
	expect(isHslaLike(hsl)).toBe(false);
	expect(isHslaLike({hue: 123})).toBe(false);
	expect(isHslaLike(123)).toBe(false);
	expect(isHslaLike(hwb)).toBe(false);
	expect(isHslaLike(rgb)).toBe(false);

	expect(isHwbaLike(hwba)).toBe(true);
	expect(isHwbaLike(hwb)).toBe(false);
	expect(isHwbaLike({hue: 123})).toBe(false);
	expect(isHwbaLike(123)).toBe(false);
	expect(isHwbaLike(hsl)).toBe(false);
	expect(isHwbaLike(rgb)).toBe(false);

	expect(isRgbaLike(rgba)).toBe(true);
	expect(isRgbaLike(rgb)).toBe(false);
	expect(isRgbaLike({red: 123})).toBe(false);
	expect(isRgbaLike(123)).toBe(false);
	expect(isRgbaLike(hsl)).toBe(false);
	expect(isRgbaLike(hwb)).toBe(false);
});
