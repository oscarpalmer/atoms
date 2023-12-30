import {expect, test} from 'bun:test';
import {
	getValue,
	isArrayOrObject,
	isNullable,
	isObject,
	setValue,
} from '../src/js/value';

test('getValue', () => {
	const data = {
		a: {
			b: [{}, new Map([['c', new Set([null, 123])]]), {}],
		},
	};

	// @ts-expect-error - Testing invalid input
	expect(getValue(undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(getValue(null)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(getValue(data, undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(getValue(data, null)).toBe(undefined);

	expect(getValue(data, '')).toBe(undefined);
	expect(getValue(data, 'a.b.1.c.1')).toBe(123);
	expect(getValue(data, 'a.b.99.c')).toBe(undefined);

	expect(getValue(data, '__proto__')).toBe(undefined);
	expect(getValue(data, 'constructor')).toBe(undefined);
	expect(getValue(data, 'prototype')).toBe(undefined);
});

test('isArrayOrObject', () => {
	expect(isArrayOrObject(undefined)).toBe(false);
	expect(isArrayOrObject(null)).toBe(false);
	expect(isArrayOrObject('')).toBe(false);
	expect(isArrayOrObject(' ')).toBe(false);
	expect(isArrayOrObject('test')).toBe(false);
	expect(isArrayOrObject(0)).toBe(false);
	expect(isArrayOrObject(1)).toBe(false);
	expect(isArrayOrObject(true)).toBe(false);
	expect(isArrayOrObject(false)).toBe(false);
	expect(isArrayOrObject({})).toBe(true);
	expect(isArrayOrObject([])).toBe(true);
	expect(isArrayOrObject([1, 2, 3])).toBe(true);
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

test('isObject', () => {
	expect(isObject(undefined)).toBe(false);
	expect(isObject(null)).toBe(false);
	expect(isObject('')).toBe(false);
	expect(isObject(' ')).toBe(false);
	expect(isObject('test')).toBe(false);
	expect(isObject(0)).toBe(false);
	expect(isObject(1)).toBe(false);
	expect(isObject(true)).toBe(false);
	expect(isObject(false)).toBe(false);
	expect(isObject([])).toBe(false);
	expect(isObject([1, 2, 3])).toBe(false);
	expect(isObject({})).toBe(true);
});

test('setValue', () => {
	const data = {
		in: {
			a: {
				nested: {
					array: [],
					map: new Map(),
					object: {},
					set: new Set(),
				},
			},
		},
	};

	// @ts-expect-error - Testing invalid input
	expect(setValue(undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(setValue(null)).toBe(null);

	// @ts-expect-error - Testing invalid input
	expect(setValue(data, undefined)).toBe(data);

	// @ts-expect-error - Testing invalid input
	expect(setValue(data, null)).toBe(data);

	expect(setValue(data, '', undefined)).toBe(data);

	setValue(data, 'in.a.nested.array.3', 123);
	setValue(data, 'in.a.nested.map.3', 123);
	setValue(data, 'in.a.nested.object.3', 123);
	setValue(data, 'in.a.nested.set.3', 123);
	setValue(data, 'in.a.new.array.5', 123);

	expect(data.in.a.nested.array[3]).toEqual(123);
	expect(data.in.a.nested.map.get('3')).toEqual(123);
	expect(data.in.a.nested.object['3']).toEqual(123);

	expect(data.in.a.nested.set.has(123)).toBe(true);

	let setArray = Array.from(data.in.a.nested.set);

	expect(setArray.length).toBe(1);
	expect(setArray[0]).toEqual(123);

	setValue(data, 'in.a.nested.set.0', 456);

	expect(data.in.a.nested.set.has(123)).toBe(false);
	expect(data.in.a.nested.set.has(456)).toBe(true);

	setArray = Array.from(data.in.a.nested.set);

	expect(setArray.length).toBe(1);
	expect(setArray[0]).toEqual(456);

	// @ts-expect-error - Testing created objects
	expect(data.in.a.new.array[5]).toEqual(123);

	// @ts-expect-error - Testing JS internals
	const {__proto__, constructor, prototype} = data;

	setValue(data, '__proto__', 123);
	setValue(data, 'constructor', 123);
	setValue(data, 'prototype', 123);

	expect(data.constructor).toBe(constructor);

	// @ts-expect-error - Testing JS internals
	expect(data.__proto__).toBe(__proto__);
	// @ts-expect-error - Testing JS internals
	expect(data.prototype).toBe(prototype);
});
