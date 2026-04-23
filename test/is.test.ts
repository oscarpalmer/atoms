import {expect, test} from 'vitest';
import {
	isArrayOrPlainObject,
	isConstructor,
	isEmpty,
	isInstanceOf,
	isKey,
	isNonArrayOrPlainObject,
	isNonConstructor,
	isNonEmpty,
	isNonInstanceOf,
	isNonKey,
	isNonNullable,
	isNonNullableOrEmpty,
	isNonNullableOrWhitespace,
	isNonNumber,
	isNonNumerical,
	isNonObject,
	isNonPlainObject,
	isNonPrimitive,
	isNonTypedArray,
	isNullable,
	isNullableOrEmpty,
	isNullableOrWhitespace,
	isNumber,
	isNumerical,
	isObject,
	isPlainObject,
	isPrimitive,
	isTypedArray,
} from '../src';
import {isNonTemplateStringsArray, isTemplateStringsArray} from '../src/internal/is';
import {isFixture} from './.fixtures/is.fixture';

const {values, length} = isFixture;

test('isArrayOrPlainObject', () => {
	const expected = Array.from({length}, (_, index) => [2, 15, 16].includes(index));

	let index = 0;

	for (; index < length; index += 1) {
		expect(isArrayOrPlainObject(values[index])).toBe(expected[index]);
		expect(isNonArrayOrPlainObject(values[index])).not.toBe(expected[index]);
	}
});

test('isConstructor', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isConstructor(values[index])).toBe(false);
		expect(isNonConstructor(values[index])).toBe(true);
	}

	const constructors = [Array, Object, Map, Set, Date, RegExp, Promise, Error];

	for (const constructor of constructors) {
		expect(isConstructor(constructor)).toBe(true);
		expect(isNonConstructor(constructor)).toBe(false);
	}
});

test('isEmpty', () => {
	for (let index = 0; index < length; index += 1) {
		const result = index < 3 || index === 4 || index === 15 || index > 17;

		expect(isEmpty(values[index])).toBe(result);
		expect(isNonEmpty(values[index])).not.toBe(result);
	}

	const items = [
		[],
		[null],
		[undefined],
		[123],
		{},
		{key: null},
		{key: undefined},
		{key: 123},
		new Map(),
		new Set(),
		new Map([['key', null]]),
		new Set([undefined]),
		new Map([['key', 123]]),
		new Set([123]),
	];

	const result = [
		true,
		true,
		true,
		false,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
		true,
		false,
		false,
	];

	for (let index = 0; index < items.length; index += 1) {
		expect(isEmpty(items[index])).toBe(result[index]);
		expect(isNonEmpty(items[index])).not.toBe(result[index]);
	}
});

test('isInstanceOf', () => {
	for (let index = 0; index < length; index += 1) {
		const result = index === 2 || index === 3 || index > 14;

		expect(isInstanceOf(Object, values[index])).toBe(result);
		expect(isNonInstanceOf(Object, values[index])).not.toBe(result);
	}

	const items = [[], {}, new Map(), new Set(), new Date(), /test/, Promise.resolve(), new Error()];

	for (let index = 0; index < items.length; index += 1) {
		expect(isInstanceOf(Object, items[index])).toBe(true);
		expect(isNonInstanceOf(Object, items[index])).toBe(false);
	}
});

test('isKey', () => {
	const indices = [4, 5, 6, 7, 8, 9, 10, 11];

	for (let index = 0; index < length; index += 1) {
		const result = indices.includes(index);

		expect(isKey(values[index])).toBe(result);
		expect(isNonKey(values[index])).not.toBe(result);
	}
});

test('isNonNullable', () => {
	const expected = Array.from({length}, (_, index) => index > 1);

	for (let index = 0; index < length; index += 1) {
		expect(isNonNullable(values[index])).toBe(expected[index]);
	}
});

test('isNullable', () => {
	const expected = Array.from({length}, (_, index) => index < 2);

	for (let index = 0; index < length; index += 1) {
		expect(isNullable(values[index])).toBe(expected[index]);
	}
});

test('isNullableOrEmpty', () => {
	const expected = Array.from({length}, (_, index) => [0, 1, 2, 3, 4].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNullableOrEmpty(values[index])).toBe(expected[index]);
		expect(isNonNullableOrEmpty(values[index])).not.toBe(expected[index]);
	}
});

test('isNullableOrWhitespace', () => {
	const expected = Array.from({length}, (_, index) => [0, 1, 2, 3, 4, 5].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNullableOrWhitespace(values[index])).toBe(expected[index]);
		expect(isNonNullableOrWhitespace(values[index])).not.toBe(expected[index]);
	}
});

test('isNumber', () => {
	const expected = Array.from({length}, (_, index) => [9, 10, 11].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNumber(values[index])).toBe(expected[index]);
		expect(isNonNumber(values[index])).not.toBe(expected[index]);
	}
});

test('isNumerical', () => {
	const expected = Array.from({length}, (_, index) => [6, 7, 9, 10, 11].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNumerical(values[index])).toBe(expected[index]);
		expect(isNonNumerical(values[index])).not.toBe(expected[index]);
	}
});

test('isObject', () => {
	const expected = Array.from(
		{length},
		(_, index) => index === 2 || index === 3 || index === 17 || index > 14,
	);

	for (let index = 0; index < length; index += 1) {
		expect(isObject(values[index])).toBe(expected[index]);
		expect(isNonObject(values[index])).not.toBe(expected[index]);
	}
});

test('isPlainObject', () => {
	const expected = Array.from({length}, (_, index) => index === 15);

	for (let index = 0; index < length; index += 1) {
		expect(isPlainObject(values[index])).toBe(expected[index]);
		expect(isNonPlainObject(values[index])).not.toBe(expected[index]);
	}
});

test('isPrimitive', () => {
	const expected = Array.from({length}, (_, index) => index !== 2 && index !== 3 && index < 15);

	for (let index = 0; index < length; index += 1) {
		expect(isPrimitive(values[index])).toBe(expected[index]);
		expect(isNonPrimitive(values[index])).not.toBe(expected[index]);
	}
});

test('isTemplateStringsArray', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isTemplateStringsArray(values[index])).toBe(false);
		expect(isNonTemplateStringsArray(values[index])).toBe(true);
	}

	function tester(strings: TemplateStringsArray) {
		expect(isTemplateStringsArray(strings)).toBe(true);
		expect(isNonTemplateStringsArray(strings)).toBe(false);
	}

	// oxlint-disable-next-line no-unused-expressions Actually used, so no worries
	tester``;
});

test('isTypedArray', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isTypedArray(values[index])).toBe(false);
		expect(isNonTypedArray(values[index])).toBe(true);
	}

	const arrays = [
		new Uint8Array([1, 2, 3]),
		new Uint8ClampedArray([1, 2, 3]),
		new Uint16Array([1, 2, 3]),
		new Uint32Array([1, 2, 3]),
		new Int8Array([1, 2, 3]),
		new Int16Array([1, 2, 3]),
		new Int32Array([1, 2, 3]),
		new Float32Array([1, 2, 3]),
		new Float64Array([1, 2, 3]),
		new BigUint64Array([1n, 2n, 3n]),
		new BigInt64Array([1n, 2n, 3n]),
	];

	for (let index = 0; index < arrays.length; index += 1) {
		expect(isTypedArray(arrays[index])).toBe(true);
		expect(isNonTypedArray(arrays[index])).toBe(false);
	}
});
