import {expect, test} from 'vitest';
import {
	getColor,
	isHexColor,
	isHslaColor,
	isHslColor,
	isHwbaColor,
	isHwbColor,
	isRgbaColor,
	isRgbColor,
	type Color,
} from '../../src';

test('', () => {
	function onHex(hex: string) {
		values.hexes.push(hex);
	}

	const color = getColor('#f00');

	const values = {
		instance: undefined as unknown as Color,
		hexes: [] as string[],
	};

	expect(values.instance).toBeUndefined();
	expect(values.hexes).toEqual([]);

	color.subscribe(instance => {
		values.instance = instance;
	});

	color.subscribe('hex', onHex);
	color.subscribe('hex', onHex);

	color.subscribe('hex', hex => {
		expect(isHexColor(hex)).toBe(true);
	});

	color.subscribe('hexa', hexa => {
		expect(isHexColor(hexa, true)).toBe(true);
	});

	color.subscribe('hsl', hsl => {
		expect(isHslColor(hsl)).toBe(true);
	});

	color.subscribe('hsla', hsla => {
		expect(isHslaColor(hsla)).toBe(true);
	});

	color.subscribe('hwb', hwb => {
		expect(isHwbColor(hwb)).toBe(true);
	});

	color.subscribe('hwba', hwba => {
		expect(isHwbaColor(hwba)).toBe(true);
	});

	color.subscribe('rgb', rgb => {
		expect(isRgbColor(rgb)).toBe(true);
	});

	color.subscribe('rgba', rgba => {
		expect(isRgbaColor(rgba)).toBe(true);
	});

	color.hex = '#0f0';

	expect(values.instance).toBe(color);
	expect(values.hexes).toEqual(['00ff00']);

	color.unsubscribe();

	color.hex = '#00f';

	expect(values.instance).toBe(color);
	expect(values.hexes).toEqual(['00ff00']);

	expect(() => {
		color.subscribe(123 as never);
	}).toThrow();

	expect(() => {
		color.subscribe('blah' as never);
	}).toThrow();

	expect(() => {
		color.subscribe('blah' as never, () => {});
	}).toThrow();
});
