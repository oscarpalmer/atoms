import {expect, test} from 'bun:test';
import {clampNumber, getNumber} from '../src/js/number';

test('clampNumber', () => {
	const max = 20;
	const min = 10;

	expect(clampNumber(max - min, min, max)).toBe(max - min);
	expect(clampNumber(min - min, min, max)).toBe(min);
	expect(clampNumber(max + max, min, max)).toBe(max);
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
