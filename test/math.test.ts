import {expect, test} from 'vitest';
import {average, count, max, median, min, round, sum} from '../src';
import {mathFixture} from './.fixtures/math.fixture';

const {invalid, valid} = mathFixture;

test('average', () => {
	expect(average(valid.one)).toBe(123);
	expect(average(valid.two)).toBe(289.5);
	expect(average(valid.three)).toBe(456);
	expect(average(valid.four)).toBe(594.75);
	expect(average(valid.five)).toBe(718.4);

	expect(average(valid.people, 'age')).toBe(30);
	expect(average(valid.items, item => item.value)).toBe(289.5);

	expect(average(invalid.empty)).toBeNaN();

	for (let index = 0; index < invalid.values.length; index += 1) {
		expect(average(invalid.values.items[index] as never)).toBeNaN();
	}
});

test('count', () => {
	expect(count(valid.one)).toBe(1);
	expect(count(valid.two)).toBe(2);
	expect(count(valid.three)).toBe(3);
	expect(count(valid.four)).toBe(4);
	expect(count(valid.five)).toBe(5);

	expect(count(valid.people, 'age', 25)).toBe(1);
	expect(count(valid.people, 'age', 35)).toBe(1);
	expect(count(valid.people, 'age', 'blah')).toBe(1);
	expect(count(valid.people, 'age', 123)).toBe(0);

	expect(count(valid.items, item => item.value, 123)).toBe(1);
	expect(count(valid.items, item => item.value, 456)).toBe(1);
	expect(count(valid.items, item => item.value, 789)).toBe(0);

	expect(count(invalid.empty)).toBe(0);

	for (let index = 0; index < invalid.values.length; index += 1) {
		expect(count(invalid.values.items[index] as never)).toBeNaN();
	}
});

test('max', () => {
	expect(max(valid.one)).toBe(123);
	expect(max(valid.two)).toBe(456);
	expect(max(valid.three)).toBe(789);
	expect(max(valid.four)).toBe(1011);
	expect(max(valid.five)).toBe(1213);

	expect(max(valid.people, 'age')).toBe(35);
	expect(max(valid.items, item => item.value)).toBe(456);

	expect(max(invalid.empty)).toBeNaN();

	for (let index = 0; index < invalid.values.length; index += 1) {
		expect(max(invalid.values.items[index] as never)).toBeNaN();
	}
});

test('median', () => {
	expect(median(valid.one)).toBe(123);
	expect(median(valid.two)).toBe(289.5);
	expect(median(valid.three)).toBe(456);
	expect(median(valid.four)).toBe(622.5);
	expect(median(valid.five)).toBe(789);

	expect(median(valid.people, 'age')).toBe(30);
	expect(median(valid.items, item => item.value)).toBe(289.5);

	expect(median(invalid.empty)).toBeNaN();

	for (let index = 0; index < invalid.values.length; index += 1) {
		const value = invalid.values.items[index];

		expect(median(value as never)).toBeNaN();
		expect(median([value] as never)).toBeNaN();
	}
});

test('min', () => {
	expect(min(valid.one)).toBe(123);
	expect(min(valid.two)).toBe(123);
	expect(min(valid.three)).toBe(123);
	expect(min(valid.four)).toBe(123);
	expect(min(valid.five)).toBe(123);

	expect(min(valid.people, 'age')).toBe(25);
	expect(min(valid.items, item => item.value)).toBe(123);

	expect(min(invalid.empty)).toBeNaN();

	for (let index = 0; index < invalid.values.length; index += 1) {
		expect(min(invalid.values.items[index] as never)).toBeNaN();
	}
});

test('round', () => {
	const value = 123.456789;

	const decimals = [null, -1, 0, 1, 2, 3, 4, 5];

	const expected = [123, 123, 123, 123.5, 123.46, 123.457, 123.4568, 123.45679];

	for (let index = 0; index < decimals.length; index += 1) {
		expect(round(value, decimals[index] as never)).toBe(expected[index]);
	}

	expect(round('abc' as never)).toBeNaN();
});

test('sum', () => {
	expect(sum(valid.one)).toBe(123);
	expect(sum(valid.two)).toBe(579);
	expect(sum(valid.three)).toBe(1368);
	expect(sum(valid.four)).toBe(2379);
	expect(sum(valid.five)).toBe(3592);

	expect(sum(valid.people, 'age')).toBe(60);
	expect(sum(valid.items, item => item.value)).toBe(579);

	expect(sum(invalid.empty)).toBeNaN();

	for (let index = 0; index < invalid.values.length; index += 1) {
		expect(sum(invalid.values.items[index] as never)).toBeNaN();
	}
});
