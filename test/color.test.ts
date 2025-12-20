import {expect, test} from 'vitest';
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
	hexToHsl,
	hexToHsla,
	hexToRgb,
	hexToRgba,
	hslToHex,
	hslToRgb,
	hslToRgba,
	isColor,
	isHexColor,
	isHslaColor,
	isHslColor,
	isRgbaColor,
	isRgbColor,
	rgbToHex,
	rgbToHsl,
	rgbToHsla,
} from '../src/color';
import {DEFAULT_HSL, DEFAULT_RGB, HEX_BLACK} from '../src/color/constants';
import {getAlphaHexadecimal} from '../src/color/misc/alpha';
import {getRandomItem} from '../src/random';

const alphas = [0, 1, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

const foregrounds = [
	'000000',
	'ffffff',
	'ffffff',
	'ffffff',
	'000000',
	'000000',
	'ffffff',
	'ffffff',
	'ffffff',
	'ffffff',
];

const hexes = [
	'faf0e6',
	'3a75c4',
	'964b00',
	'006994',
	'9bddff',
	'ff9933',
	'122faa',
	'536872',
	'686c5e',
	'483c32',
];

const hsls = [
	{hue: 30, lightness: 94.12, saturation: 66.67},
	{hue: 214.35, lightness: 49.8, saturation: 54.33},
	{hue: 30, lightness: 29.41, saturation: 100},
	{hue: 197.43, lightness: 29.02, saturation: 100},
	{hue: 200.4, lightness: 80.39, saturation: 100},
	{hue: 30, lightness: 60, saturation: 100},
	{hue: 228.55, lightness: 36.86, saturation: 80.85},
	{hue: 199.35, lightness: 38.63, saturation: 15.74},
	{hue: 77.14, lightness: 39.61, saturation: 6.93},
	{hue: 27.27, lightness: 23.92, saturation: 18.03},
];

const hslas = hsls.map((hsl, index) => ({...hsl, alpha: alphas[index]}));

const instances = hexes.map(hex => getColor(hex));

const rgbs = [
	{blue: 230, green: 240, red: 250},
	{blue: 196, green: 117, red: 58},
	{blue: 0, green: 75, red: 150},
	{blue: 148, green: 105, red: 0},
	{blue: 255, green: 221, red: 155},
	{blue: 51, green: 153, red: 255},
	{blue: 170, green: 47, red: 18},
	{blue: 114, green: 104, red: 83},
	{blue: 94, green: 108, red: 104},
	{blue: 50, green: 60, red: 72},
];

const rgbas = rgbs.map((rgb, index) => ({...rgb, alpha: alphas[index]}));

const shorts = ['fff', '3ac', '960', '069', '9bf', 'f93', '12a', '568', '685', '432'];

const {length} = hexes;

test('color', () => {
	const color = getColor('hello, world!');

	expect(color.hex).toEqual('000000');
	expect(color.alpha).toEqual(1);

	color.hex = 'ffffff';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffff');
	expect(color.alpha).toEqual(1);

	color.hexa = 'ffffff00';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffff00');
	expect(color.alpha).toEqual(0);

	color.hexa = 'ffffffdd';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffdd');
	expect(color.alpha).toEqual(221 / 255);

	color.hexa = 'ffffff';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffff');
	expect(color.alpha).toEqual(1);

	color.hex = 'hello, world!';

	expect(color.hex).toEqual('ffffff');
	expect(color.alpha).toEqual(1);

	color.hsl = {hue: 0, lightness: 'blah' as never, saturation: 0};

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(1);

	color.hsl = 123 as never;

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(1);

	color.hsl = {hue: 900, lightness: 0, saturation: 0};

	expect(color.hsl).toEqual({hue: 360, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(1);

	color.rgb = {red: 0, green: 'blah' as never, blue: 0};

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
	expect(color.alpha).toEqual(1);

	color.rgb = 123 as never;

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
	expect(color.alpha).toEqual(1);

	color.rgb = {red: 552, green: 0, blue: 0};

	expect(color.rgb).toEqual({red: 255, green: 0, blue: 0});
	expect(color.alpha).toEqual(1);

	color.alpha = -99;

	expect(color.alpha).toEqual(0);

	color.alpha = 500;

	expect(color.alpha).toEqual(1);

	color.alpha = Number.NaN;

	expect(color.alpha).toEqual(1);

	color.alpha = 44;

	expect(color.alpha).toEqual(0.44);

	color.hsla = {hue: 180, lightness: 25, saturation: 75, alpha: 0.5};

	expect(color.hsla).toEqual({
		hue: 180,
		lightness: 25,
		saturation: 75,
		alpha: 0.5,
	});
	expect(color.alpha).toEqual(0.5);

	color.rgba = {red: 255, green: 128, blue: 0, alpha: 0.25};

	expect(color.rgba).toEqual({red: 255, green: 128, blue: 0, alpha: 0.25});
	expect(color.alpha).toEqual(0.25);
});

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

test('hexToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];
		expect(hexToHsl(hex)).toEqual(hsl);
		expect(hexToHsla(hex)).toEqual({...hsl, alpha: 1});
	}

	expect(hexToHsl('invalid')).toEqual(DEFAULT_HSL);
	expect(hexToHsla('invalid')).toEqual({...DEFAULT_HSL, alpha: 1});
});

test('hexToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const rgb = rgbs[index];

		expect(hexToRgb(hex)).toEqual(rgb);
		expect(hexToRgba(hex)).toEqual({...rgb, alpha: 1});
	}

	expect(hexToRgb('invalid')).toEqual(DEFAULT_RGB);
	expect(hexToRgba('invalid')).toEqual({...DEFAULT_RGB, alpha: 1});
});

test('hslToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];

		expect(hslToHex(hsl)).toEqual(hex);
		expect(hslToHex(hsl, true)).toEqual(`${hex}ff`);
	}
});

test('hslToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const rgb = rgbs[index];

		expect(hslToRgb(hsl)).toEqual(rgb);
		expect(hslToRgba(hsl)).toEqual({...rgb, alpha: 1});
	}

	expect(hslToRgb(123 as never)).toEqual(DEFAULT_RGB);
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

test('rgbToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const rgb = rgbs[index];

		expect(rgbToHex(rgb)).toEqual(hex);
		expect(rgbToHex(rgb, true)).toEqual(`${hex}ff`);
	}

	expect(rgbToHex(123 as never)).toEqual(HEX_BLACK);
});

test('rgbToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const rgb = rgbs[index];

		expect(rgbToHsl(rgb)).toEqual(hsl);
		expect(rgbToHsla(rgb)).toEqual({...hsl, alpha: 1});
	}

	expect(
		rgbToHsl({
			red: 192,
			green: 128,
			blue: 64,
		}),
	).toEqual({
		hue: 30,
		lightness: 50.2,
		saturation: 50.39,
	});

	expect(
		rgbToHsl({
			red: 192,
			green: 64,
			blue: 128,
		}),
	).toEqual({
		hue: 330,
		lightness: 50.2,
		saturation: 50.39,
	});

	expect(rgbToHsl(123 as never)).toEqual(DEFAULT_HSL);
});
