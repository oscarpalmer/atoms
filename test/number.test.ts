import {expect, test} from 'bun:test';
import {clamp, getNumber} from '../src/js/number';

test('clamp', () => {
	const max = 20;
	const min = 10;

	expect(clamp(max - min, min, max)).toBe(max - min);
	expect(clamp(min - min, min, max)).toBe(min);
	expect(clamp(max + max, min, max)).toBe(max);

	expect(clamp(min - min, min, max, true)).toBe(max);
	expect(clamp(max + max, min, max, true)).toBe(min);
});

test('getNumber', () => {
	const obj = {};

	obj.valueOf = () => 123;

	expect(getNumber(undefined)).toBeNaN();
	expect(getNumber(null)).toBeNaN();
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
	expect(getNumber({})).toBeNaN();
	expect(getNumber(obj)).toBe(123);
});
