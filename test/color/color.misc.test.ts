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
	isRgbaColor,
	isRgbColor,
} from '../../src/color';
import {getAlphaHexadecimal} from '../../src/color/misc/alpha';
import {colorFixture} from '../.fixtures/color.fixture';

const {alphas, hexes, hsls, hslas, rgbs} = colorFixture;
const {length} = hexes;

test('formatting', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];
		const rgb = rgbs[index];

		const color = getColor(hslas[index]);

		expect(String(color)).toBe(`#${hex}`);

		expect(color.toHexString()).toBe(`#${hex}`);
		expect(color.toHexString(true)).toBe(`#${hex}${getAlphaHexadecimal(alphas[index])}`);

		expect(color.toHslString()).toBe(`hsl(${hsl.hue} ${hsl.saturation} ${hsl.lightness})`);

		expect(color.toHslString(true)).toBe(
			`hsl(${hsl.hue} ${hsl.saturation} ${hsl.lightness} / ${alphas[index]})`,
		);

		expect(color.toRgbString()).toBe(`rgb(${rgb.red} ${rgb.green} ${rgb.blue})`);

		expect(color.toRgbString(true)).toBe(
			`rgb(${rgb.red} ${rgb.green} ${rgb.blue} / ${alphas[index]})`,
		);
	}
});

test('is', () => {
	const hex = getHexColor(hexes[0]);

	const hsl = getHslColor(hex);
	const hsla = getHslaColor(hex);

	const rgb = getRgbColor(hex);
	const rgba = getRgbaColor(hex);

	expect(isHexColor('aaa')).toBe(true);
	expect(isHexColor('aaaa')).toBe(true);
	expect(isHexColor('aaaa', false)).toBe(false);
	expect(isHexColor('aaaaaa')).toBe(true);
	expect(isHexColor('aaaaaaa')).toBe(false);
	expect(isHexColor('aaaaaaaa')).toBe(true);
	expect(isHexColor('aaaaaaaa', false)).toBe(false);
	expect(isHexColor('ööö')).toBe(false);
	expect(isHexColor('öööö')).toBe(false);
	expect(isHexColor('öööööö')).toBe(false);
	expect(isHexColor('öööööööö')).toBe(false);

	expect(isHexColor(hex)).toBe(true);
	expect(isHexColor(hsl)).toBe(false);
	expect(isHexColor(rgb)).toBe(false);

	expect(isHslColor(hex)).toBe(false);
	expect(isHslColor(hsl)).toBe(true); /*  */
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

	expect(isRgbColor(hex)).toBe(false);
	expect(isRgbColor(hsl)).toBe(false);
	expect(isRgbColor(rgb)).toBe(true);
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
