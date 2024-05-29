import {expect, test} from 'bun:test';
import {average, max, min, sum} from '../src/js/math';

const one = [123];
const two = [123, 456];
const three = [123, 456, 789];

test('average', () => {
	expect(average([])).toBeNaN();
	expect(average(one)).toBe(123);
	expect(average(two)).toBe(289.5);
	expect(average(three)).toBe(456);
});

test('max', () => {
	expect(max([])).toBeNaN();
	expect(max(one)).toBe(123);
	expect(max(two)).toBe(456);
	expect(max(three)).toBe(789);
});

test('min', () => {
	expect(min([])).toBeNaN();
	expect(min(one)).toBe(123);
	expect(min(two)).toBe(123);
	expect(min(three)).toBe(123);
});

test('sum', () => {
	expect(sum([])).toBe(0);
	expect(sum(one)).toBe(123);
	expect(sum(two)).toBe(579);
	expect(sum(three)).toBe(1368);
});
