import {expect, test} from 'vitest';
import {average, max, min, round, sum} from '../src/math';

const one = [123];
const two = [123, 456];
const three = [123, 456, 789];

const four = [
	{age: 25, name: 'John'},
	{age: 30, name: 'Jane'},
	{age: 35, name: 'Joe'},
];

test('average', () => {
	expect(average([])).toBeNaN();
	expect(average(one)).toBe(123);
	expect(average(two)).toBe(289.5);
	expect(average(three)).toBe(456);
	expect(average(four, 'age')).toBe(30);
	expect(average(four, item => item.age)).toBe(30);
});

test('max', () => {
	expect(max([])).toBeNaN();
	expect(max(one)).toBe(123);
	expect(max(two)).toBe(456);
	expect(max(three)).toBe(789);
	expect(max(four, 'age')).toBe(35);
	expect(max(four, item => item.age)).toBe(35);
});

test('min', () => {
	expect(min([])).toBeNaN();
	expect(min(one)).toBe(123);
	expect(min(two)).toBe(123);
	expect(min(three)).toBe(123);
	expect(min(four, 'age')).toBe(25);
	expect(min(four, item => item.age)).toBe(25);
});

test('round', () => {
	const value = 123.456789;

	const decimals = [null, -1, 0, 1, 2, 3, 4, 5];

	const expected = [123, 123, 123, 123.5, 123.46, 123.457, 123.4568, 123.45679];

	for (let index = 0; index < decimals.length; index += 1) {
		expect(round(value, decimals[index] as never)).toBe(expected[index]);
	}
});

test('sum', () => {
	expect(sum([])).toBe(0);
	expect(sum(one)).toBe(123);
	expect(sum(two)).toBe(579);
	expect(sum(three)).toBe(1368);
});
