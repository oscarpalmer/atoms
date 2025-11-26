/** biome-ignore-all lint/style/noMagicNumbers: Testing */
/** biome-ignore-all lint/nursery/useExplicitType: Testing */
import {expect, test} from 'vitest';
import {
	isArrayOrPlainObject,
	isEmpty,
	isKey,
	isNullable,
	isNullableOrEmpty,
	isNullableOrWhitespace,
	isNumber,
	isNumerical,
	isObject,
	isPlainObject,
	isPrimitive,
} from '../src/is';

const values = [
	undefined,
	null,
	[],
	() => {},
	'',
	' ',
	'123',
	'123.456',
	'test',
	0,
	123,
	123.456,
	true,
	false,
	Symbol('test'),
	{},
	[1, 2, 3],
	() => 'hello, world',
	new Map(),
	new Set(),
];

const {length} = values;

test('isArrayOrPlainObject', () => {
	const expected = Array.from({length}, (_, index) =>
		[2, 15, 16].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isArrayOrPlainObject(values[index])).toBe(expected[index]);
	}
});

test('isEmpty', () => {
	expect(isEmpty([])).toBe(true);
	expect(isEmpty([null])).toBe(true);
	expect(isEmpty([undefined])).toBe(true);
	expect(isEmpty([123])).toBe(false);

	expect(isEmpty({})).toBe(true);
	expect(isEmpty({key: null})).toBe(true);
	expect(isEmpty({key: undefined})).toBe(true);
	expect(isEmpty({key: 123})).toBe(false);
});

test('isKey', () => {
	const indices = [4, 5, 6, 7, 8, 9, 10, 11];

	for (let index = 0; index < length; index += 1) {
		expect(isKey(values[index])).toBe(indices.includes(index));
	}
});

test('isNullable', () => {
	const expected = Array.from({length}, (_, index) => index < 2);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNullable(values[index])).toBe(expected[index]);
	}
});

test('isNullableOrEmpty', () => {
	const expected = Array.from({length}, (_, index) =>
		[0, 1, 2, 3, 4].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNullableOrEmpty(values[index])).toBe(expected[index]);
	}
});

test('isNullableOrWhitespace', () => {
	const expected = Array.from({length}, (_, index) =>
		[0, 1, 2, 3, 4, 5].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNullableOrWhitespace(values[index])).toBe(expected[index]);
	}
});

test('isNumber', () => {
	const expected = Array.from({length}, (_, index) =>
		[9, 10, 11].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNumber(values[index])).toBe(expected[index]);
	}
});

test('isNumerical', () => {
	const expected = Array.from({length}, (_, index) =>
		[6, 7, 9, 10, 11].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNumerical(values[index])).toBe(expected[index]);
	}
});

test('isObject', () => {
	const expected = Array.from(
		{length},
		(_, index) => index === 2 || index === 3 || index === 17 || index > 14,
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isObject(values[index])).toBe(expected[index]);
	}
});

test('isPlainObject', () => {
	const expected = Array.from({length}, (_, index) => index === 15);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isPlainObject(values[index])).toBe(expected[index]);
	}
});

test('isPrimitive', () => {
	const expected = Array.from(
		{length},
		(_, index) => index !== 2 && index !== 3 && index < 15,
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isPrimitive(values[index])).toBe(expected[index]);
	}
});
