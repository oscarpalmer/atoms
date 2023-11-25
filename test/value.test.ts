import {expect, test} from 'bun:test';
import {getValue, isNullable} from '../src/js/value';

test('getValue', () => {
	const data = {
		a: {
			b: [
				{},
				{
					c: 123,
				},
				{},
			],
		},
	};

	expect(getValue(undefined)).toBe(undefined);
	expect(getValue(null)).toBe(undefined);
	expect(getValue(data, undefined)).toBe(undefined);
	expect(getValue(data, null)).toBe(undefined);
	expect(getValue(data, '')).toBe(undefined);
	expect(getValue(data, 'a.b.1.c')).toBe(123);
	expect(getValue(data, 'a.b.99.c')).toBe(undefined);
});

test('isNullable', () => {
	expect(isNullable(undefined)).toBe(true);
	expect(isNullable(null)).toBe(true);
	expect(isNullable('')).toBe(false);
	expect(isNullable(' ')).toBe(false);
	expect(isNullable('test')).toBe(false);
	expect(isNullable(0)).toBe(false);
	expect(isNullable(1)).toBe(false);
	expect(isNullable(true)).toBe(false);
	expect(isNullable(false)).toBe(false);
	expect(isNullable({})).toBe(false);
	expect(isNullable([])).toBe(false);
	expect(isNullable([1, 2, 3])).toBe(false);
});
