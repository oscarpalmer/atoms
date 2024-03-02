import {expect, test} from 'bun:test';
import {
	isArrayOrPlainObject,
	isNullable,
	isNullableOrWhitespace,
	isNumber,
	isNumerical,
	isObject,
	isPlainObject,
} from '../src/js/is';

const values = [
	undefined,
	null,
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
	[],
	() => {},
];

const {length} = values;

test('isArrayOrPlainObject', () => {
	const expected = Array.from({length}, (_, index) => [13, 14].includes(index));

	let index = 0;

	for (; index < length; index += 1) {
		expect(isArrayOrPlainObject(values[index])).toBe(expected[index]);
	}
});

test('isNullable', () => {
	const expected = Array.from({length}, (_, index) => index < 2);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNullable(values[index])).toBe(expected[index]);
	}
});

test('isNullableOrWhitespace', () => {
	const expected = Array.from({length}, (_, index) =>
		[0, 1, 2, 3, length - 2].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNullableOrWhitespace(values[index])).toBe(expected[index]);
	}
});

test('isNumber', () => {
	const expected = Array.from({length}, (_, index) =>
		[7, 8, 9].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNumber(values[index])).toBe(expected[index]);
	}
});

test('isNumerical', () => {
	const expected = Array.from({length}, (_, index) =>
		[4, 5, 7, 8, 9].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isNumerical(values[index])).toBe(expected[index]);
	}
});

test('isObject', () => {
	const expected = Array.from({length}, (_, index) =>
		[13, 14, 15].includes(index),
	);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isObject(values[index])).toBe(expected[index]);
	}
});

test('isPlainObject', () => {
	const expected = Array.from({length}, (_, index) => index === 13);

	let index = 0;

	for (; index < length; index += 1) {
		expect(isPlainObject(values[index])).toBe(expected[index]);
	}
});
