/** biome-ignore-all lint/style/noMagicNumbers: Testing */
/** biome-ignore-all lint/nursery/useExplicitType: Testing */
import {expect, test} from 'vitest';
import {between, clamp, getNumber} from '../src/number';

test('between', () => {
	const max = 20;
	const min = 10;

	expect(between(max - min, min, max)).toBe(true);
	expect(between(min, min, max)).toBe(true);
	expect(between(max, min, max)).toBe(true);
	expect(between(max - min, max, min)).toBe(true);
	expect(between(max, max, max)).toBe(true);

	expect(between('blah' as never, min, max)).toBe(false);
	expect(between(max - min, 'blah' as never, max)).toBe(false);
	expect(between(max - min, min, 'blah' as never)).toBe(false);
});

test('clamp', () => {
	const max = 20;
	const min = 10;

	expect(clamp(max - min, min, max)).toBe(max - min);
	expect(clamp(min - min, min, max)).toBe(min);
	expect(clamp(max + max, min, max)).toBe(max);

	expect(clamp(min - min, min, max, true)).toBe(max);
	expect(clamp(max + max, min, max, true)).toBe(min);

	expect(clamp('blah' as never, min, max)).toBeNaN();
	expect(clamp(max - min, 'blah' as never, max)).toBeNaN();
	expect(clamp(max - min, min, 'blah' as never)).toBeNaN();
});

test('getNumber', () => {
	const a = {};
	const b = {};
	const c = {};

	a.toString = () => '123';
	a.valueOf = () => 123;

	b.valueOf = () => a;

	c.valueOf = () => b;

	expect(getNumber(123)).toBe(123);
	expect(getNumber(undefined)).toBeNaN();
	expect(getNumber(null)).toBeNaN();
	expect(getNumber(true)).toBe(1);
	expect(getNumber(false)).toBe(0);
	expect(getNumber(' ')).toBeNaN();
	expect(getNumber('0')).toBe(0);
	expect(getNumber('000')).toBe(0);
	expect(getNumber('123')).toBe(123);
	expect(getNumber('123.456')).toBe(123.456);
	expect(getNumber('123_456.789')).toBe(123456.789);
	expect(getNumber('0b101')).toBe(5);
	expect(getNumber('0o10')).toBe(8);
	expect(getNumber('0x10')).toBe(16);
	expect(getNumber(Symbol())).toBeNaN();
	expect(getNumber([])).toBeNaN();
	expect(getNumber({})).toBeNaN();
	expect(getNumber(() => {})).toBeNaN();
	expect(getNumber(() => 123)).toBe(123);
	expect(getNumber(a)).toBe(123);
	expect(getNumber(b)).toBe(123);
	expect(getNumber(c)).toBeNaN();
});
