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
	isSubscription,
	type Color,
} from '../../src';
import {isColorSubscription} from '../../src/color/misc/is';

test('', () => {
	function onHex(hex: string) {
		values.hexes.push(hex);
	}

	const color = getColor('#f00');

	const values = {
		instance: undefined as unknown as Color,
		hexes: [] as string[],
		signaled: [] as string[],
	};

	expect(values.instance).toBeUndefined();
	expect(values.hexes).toEqual([]);

	color.subscribe(instance => {
		values.instance = instance;
	});

	const hexOne = color.subscribe('hex', onHex);
	const hexTwo = color.subscribe('hex', onHex);

	expect(hexOne).toBe(hexTwo);

	expect(isSubscription(hexOne)).toBe(true);
	expect(isSubscription(hexTwo)).toBe(true);
	expect(isSubscription(color)).toBe(false);

	expect(isColorSubscription(hexOne)).toBe(true);
	expect(isColorSubscription(hexTwo)).toBe(true);
	expect(isColorSubscription(color)).toBe(false);

	const controller = new AbortController();

	color.subscribe(
		'hex',
		hex => {
			values.signaled.push(hex);
		},
		controller.signal,
	);

	expect(() => {
		color.subscribe('hex', () => {}, AbortSignal.abort());
	}).toThrow();

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

	expect(values.instance).toBe(color);
	expect(values.hexes).toEqual(['ff0000']);
	expect(values.signaled).toEqual(['ff0000']);

	controller.abort();

	color.hex = '#0f0';

	expect(values.instance).toBe(color);
	expect(values.hexes).toEqual(['ff0000', '00ff00']);
	expect(values.signaled).toEqual(['ff0000']);

	color.unsubscribe();

	color.hex = '#00f';

	expect(values.instance).toBe(color);
	expect(values.hexes).toEqual(['ff0000', '00ff00']);
	expect(values.signaled).toEqual(['ff0000']);

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
