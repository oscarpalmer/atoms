import {expect, test} from 'bun:test';
import {
	chunk,
	exists,
	groupBy,
	insert,
	push,
	splice,
	unique,
} from '../src/js/array';

test('chunk', () => {
	const array = Array.from({length: 10}, (_, i) => i + 1);

	expect(chunk(array, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);

	expect(chunk(array, 100)).toEqual([array]);
});

test('exists', () => {
	const simple = [1, 2, 3, 4];

	expect(exists(simple, 2)).toBe(true);
	expect(exists(simple, 5)).toBe(false);

	const complex = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const existsByCallback = exists(complex, 3, item => item.id);
	const existsByKey = exists(complex, 3, 'id');

	expect(existsByCallback).toEqual(true);
	expect(existsByKey).toEqual(true);
});

test('groupBy', () => {
	const array = [
		{name: 'Alice', age: 25},
		{name: 'Bob', age: 30},
		{name: 'Charlie', age: 25},
	];

	const result = {
		25: [
			{name: 'Alice', age: 25},
			{name: 'Charlie', age: 25},
		],
		30: [{name: 'Bob', age: 30}],
	};

	const groupedByAgeCallback = groupBy(array, item => item.age);
	const groupedByAgeKey = groupBy(array, 'age');

	expect(groupedByAgeCallback).toEqual(result);
	expect(groupedByAgeKey).toEqual(result);
	expect(groupedByAgeCallback).toEqual(groupedByAgeKey);

	expect(groupBy(array, 'not.ok')).toEqual({});
});

test('insert', () => {
	const length = 100_000;

	const values = Array.from({length}, (_, i) => `#${i + 1}`);

	try {
		const failure: Array<number | string> = [1, 2, 3];

		failure.splice(1, 0, ...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: Array<number | string> = [1, 2, 3];

	insert(array, 1, values);

	expect(array).toHaveLength(length + 3);
	expect(array[0]).toBe(1);
	expect(array[1]).toBe('#1');
	expect(array[length + 1]).toBe(2);
	expect(array[length + 2]).toBe(3);
});

test('push', () => {
	const length = 100_000;

	const values = Array.from({length}, (_, i) => i + 1);

	try {
		const failure: number[] = [];

		failure.push(...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: number[] = [];

	expect(push(array, values)).toBe(length);
});

test('splice', () => {
	const length = 100_000;

	const values = Array.from({length}, (_, i) => `#${i + 1}`);

	try {
		const failure: Array<number | string> = [1, 2, 3];

		failure.splice(1, 1, ...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: Array<number | string> = [1, 2, 3];

	expect(splice(array, 1, 1, values)).toEqual([2]);
	expect(array).toHaveLength(length + 2);
	expect(array[0]).toBe(1);
	expect(array[1]).toBe('#1');
	expect(array[length + 1]).toBe(3);
});

test('unique', () => {
	const simple = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];

	expect(unique(simple)).toEqual([1, 2, 3, 4]);

	const complex = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 3, name: 'Charlie'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const result = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const uniqueByCallback = unique(complex, item => item.id);
	const uniqueByKey = unique(complex, 'id');

	expect(uniqueByCallback).toEqual(result);
	expect(uniqueByKey).toEqual(result);
	expect(uniqueByCallback).toEqual(uniqueByKey);
});
