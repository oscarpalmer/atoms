import {expect, test} from 'vitest';
import {
	isArrayOrPlainObject,
	isConstructor,
	isEmpty,
	isKey,
	isNonNullable,
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
import {isFixture} from './.fixtures/is.fixture';

const {values, length} = isFixture;

test('isArrayOrPlainObject', () => {
	const expected = Array.from({length}, (_, index) => [2, 15, 16].includes(index));

	let index = 0;

	for (; index < length; index += 1) {
		expect(isArrayOrPlainObject(values[index])).toBe(expected[index]);
	}
});

test('isConstructor', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isConstructor(values[index])).toBe(false);
	}

	const constructors = [Array, Object, Map, Set, Date, RegExp, Promise, Error];

	for (const constructor of constructors) {
		expect(isConstructor(constructor)).toBe(true);
	}
});

test('isEmpty', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isEmpty(values[index])).toBe(index < 3 || index === 4 || index === 15 || index > 17);
	}

	expect(isEmpty([])).toBe(true);
	expect(isEmpty([null])).toBe(true);
	expect(isEmpty([undefined])).toBe(true);
	expect(isEmpty([123])).toBe(false);

	expect(isEmpty({})).toBe(true);
	expect(isEmpty({key: null})).toBe(true);
	expect(isEmpty({key: undefined})).toBe(true);
	expect(isEmpty({key: 123})).toBe(false);

	expect(isEmpty(new Map())).toBe(true);
	expect(isEmpty(new Set())).toBe(true);
	expect(isEmpty(new Map([['key', null]]))).toBe(true);
	expect(isEmpty(new Set([undefined]))).toBe(true);
	expect(isEmpty(new Map([['key', 123]]))).toBe(false);
	expect(isEmpty(new Set([123]))).toBe(false);
});

test('isKey', () => {
	const indices = [4, 5, 6, 7, 8, 9, 10, 11];

	for (let index = 0; index < length; index += 1) {
		expect(isKey(values[index])).toBe(indices.includes(index));
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
	}
});

test('isNullableOrWhitespace', () => {
	const expected = Array.from({length}, (_, index) => [0, 1, 2, 3, 4, 5].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNullableOrWhitespace(values[index])).toBe(expected[index]);
	}
});

test('isNumber', () => {
	const expected = Array.from({length}, (_, index) => [9, 10, 11].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNumber(values[index])).toBe(expected[index]);
	}
});

test('isNumerical', () => {
	const expected = Array.from({length}, (_, index) => [6, 7, 9, 10, 11].includes(index));

	for (let index = 0; index < length; index += 1) {
		expect(isNumerical(values[index])).toBe(expected[index]);
	}
});

test('isObject', () => {
	const expected = Array.from(
		{length},
		(_, index) => index === 2 || index === 3 || index === 17 || index > 14,
	);

	for (let index = 0; index < length; index += 1) {
		expect(isObject(values[index])).toBe(expected[index]);
	}
});

test('isPlainObject', () => {
	const expected = Array.from({length}, (_, index) => index === 15);

	for (let index = 0; index < length; index += 1) {
		expect(isPlainObject(values[index])).toBe(expected[index]);
	}
});

test('isPrimitive', () => {
	const expected = Array.from({length}, (_, index) => index !== 2 && index !== 3 && index < 15);

	for (let index = 0; index < length; index += 1) {
		expect(isPrimitive(values[index])).toBe(expected[index]);
	}
});

test('isTypedArray', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isTypedArray(values[index])).toBe(false);
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

	for (const array of arrays) {
		expect(isTypedArray(array)).toBe(true);
	}
});
