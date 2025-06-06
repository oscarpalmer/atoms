import {expect, test} from 'vitest';
import {average, max, min, round, sum} from '../src/math';

const one = [123, 'abc'];
const two = [123, 'abc', 456];
const three = [123, 'abc', 456, 'def', 789];

const four = [
	{age: 25, name: 'John'},
	{age: 30, name: 'Jane'},
	{age: 35, name: 'Joe'},
	{name: 'invalid'},
];

test('average', () => {
	expect(average([])).toBeNaN();
	expect(average(['abc'] as never)).toBeNaN();
	expect(average(one as never)).toBe(123);
	expect(average(two as never)).toBe(289.5);
	expect(average(three as never)).toBe(456);
	expect(average(four, 'age' as never)).toBe(30);
	expect(average(four, item => item.age as never)).toBe(30);
});

test('max', () => {
	expect(max([])).toBeNaN();
	expect(max(one as never)).toBe(123);
	expect(max(two as never)).toBe(456);
	expect(max(three as never)).toBe(789);
	expect(max(four, 'age' as never)).toBe(35);
	expect(max(four, item => item.age as never)).toBe(35);
});

test('min', () => {
	expect(min([])).toBeNaN();
	expect(min(one as never)).toBe(123);
	expect(min(two as never)).toBe(123);
	expect(min(three as never)).toBe(123);
	expect(min(four, 'age' as never)).toBe(25);
	expect(min(four, item => item.age as never)).toBe(25);
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
	expect(sum([])).toBeNaN();
	expect(sum(one as number[])).toBe(123);
	expect(sum(two as number[])).toBe(579);
	expect(sum(three as number[])).toBe(1368);
	expect(sum(four, 'age' as never)).toBe(90);
	expect(sum(four, item => item.age as never)).toBe(90);
});
