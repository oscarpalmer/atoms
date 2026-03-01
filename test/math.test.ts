import {expect, test} from 'vitest';
import {average, ceil, count, floor, max, median, min, round, sum} from '../src';
import {mathFixture} from './.fixtures/math.fixture';

const {array, rounded} = mathFixture;

test('average', () => {
	expect(average(array.valid.one)).toBe(123);
	expect(average(array.valid.two)).toBe(289.5);
	expect(average(array.valid.three)).toBe(456);
	expect(average(array.valid.four)).toBe(594.75);
	expect(average(array.valid.five)).toBe(718.4);

	expect(average(array.valid.people, 'age')).toBe(30);
	expect(average(array.valid.items, item => item.value)).toBe(289.5);

	expect(average(array.invalid.empty)).toBeNaN();

	for (let index = 0; index < array.invalid.values.length; index += 1) {
		expect(average(array.invalid.values.items[index] as never)).toBeNaN();
	}
});

test('ceil', () => {
	for (let index = 0; index < rounded.length; index += 1) {
		expect(ceil(rounded.value, rounded.decimals[index] as never)).toBe(rounded.result.ceil[index]);
	}

	expect(ceil('abc' as never)).toBeNaN();
});

test('count', () => {
	expect(count(array.valid.one)).toBe(1);
	expect(count(array.valid.two)).toBe(2);
	expect(count(array.valid.three)).toBe(3);
	expect(count(array.valid.four)).toBe(4);
	expect(count(array.valid.five)).toBe(5);

	expect(count(array.valid.people, 'age', 25)).toBe(1);
	expect(count(array.valid.people, 'age', 35)).toBe(1);
	expect(count(array.valid.people, 'age', 'blah' as never)).toBe(1);
	expect(count(array.valid.people, 'age', 123)).toBe(0);

	expect(count(array.valid.items, item => item.value, 123)).toBe(1);
	expect(count(array.valid.items, item => item.value, 456)).toBe(1);
	expect(count(array.valid.items, item => item.value, 789)).toBe(0);

	expect(count(array.invalid.empty)).toBe(0);

	for (let index = 0; index < array.invalid.values.length; index += 1) {
		expect(count(array.invalid.values.items[index] as never)).toBeNaN();
	}
});

test('floor', () => {
	for (let index = 0; index < rounded.length; index += 1) {
		expect(floor(rounded.value, rounded.decimals[index] as never)).toBe(
			rounded.result.floor[index],
		);
	}

	expect(floor('abc' as never)).toBeNaN();
});

test('max', () => {
	expect(max(array.valid.one)).toBe(123);
	expect(max(array.valid.two)).toBe(456);
	expect(max(array.valid.three)).toBe(789);
	expect(max(array.valid.four)).toBe(1011);
	expect(max(array.valid.five)).toBe(1213);

	expect(max(array.valid.people, 'age')).toBe(35);
	expect(max(array.valid.items, item => item.value)).toBe(456);

	expect(max(array.invalid.empty)).toBeNaN();

	for (let index = 0; index < array.invalid.values.length; index += 1) {
		expect(max(array.invalid.values.items[index] as never)).toBeNaN();
	}
});

test('median', () => {
	expect(median(array.valid.one)).toBe(123);
	expect(median(array.valid.two)).toBe(289.5);
	expect(median(array.valid.three)).toBe(456);
	expect(median(array.valid.four)).toBe(622.5);
	expect(median(array.valid.five)).toBe(789);

	expect(median(array.valid.people, 'age')).toBe(30);
	expect(median(array.valid.items, item => item.value)).toBe(289.5);

	expect(median(array.invalid.empty)).toBeNaN();

	for (let index = 0; index < array.invalid.values.length; index += 1) {
		const value = array.invalid.values.items[index];

		expect(median(value as never)).toBeNaN();
		expect(median([value] as never)).toBeNaN();
	}
});

test('min', () => {
	expect(min(array.valid.one)).toBe(123);
	expect(min(array.valid.two)).toBe(123);
	expect(min(array.valid.three)).toBe(123);
	expect(min(array.valid.four)).toBe(123);
	expect(min(array.valid.five)).toBe(123);

	expect(min(array.valid.people, 'age')).toBe(25);
	expect(min(array.valid.items, item => item.value)).toBe(123);

	expect(min(array.invalid.empty)).toBeNaN();

	for (let index = 0; index < array.invalid.values.length; index += 1) {
		expect(min(array.invalid.values.items[index] as never)).toBeNaN();
	}
});

test('round', () => {
	for (let index = 0; index < rounded.length; index += 1) {
		expect(round(rounded.value, rounded.decimals[index] as never)).toBe(
			rounded.result.round[index],
		);
	}

	expect(round('abc' as never)).toBeNaN();
});

test('sum', () => {
	expect(sum(array.valid.one)).toBe(123);
	expect(sum(array.valid.two)).toBe(579);
	expect(sum(array.valid.three)).toBe(1368);
	expect(sum(array.valid.four)).toBe(2379);
	expect(sum(array.valid.five)).toBe(3592);

	expect(sum(array.valid.people, 'age')).toBe(60);
	expect(sum(array.valid.items, item => item.value)).toBe(579);

	expect(sum(array.invalid.empty)).toBeNaN();

	for (let index = 0; index < array.invalid.values.length; index += 1) {
		expect(sum(array.invalid.values.items[index] as never)).toBeNaN();
	}
});
