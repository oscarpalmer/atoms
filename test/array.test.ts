import {expect, test} from 'bun:test';
import {
	chunk,
	exists,
	filter,
	find,
	groupBy,
	indexOf,
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

	const existsByKeyCallback = exists(complex, 3, item => item.id);
	const existsByKeyValue = exists(complex, 3, 'id');

	expect(existsByKeyCallback).toEqual(true);
	expect(existsByKeyValue).toEqual(true);

	const existsByValueCallback = exists(complex, item => item.id === 3);

	expect(existsByValueCallback).toEqual(true);
});

test('filter', () => {
	const simple = [1, 2, 3, 4];

	expect(filter(simple, 2)).toEqual([2]);
	expect(filter(simple, 5)).toEqual([]);

	const complex = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const filterByKeyValue = filter(complex, 3, 'id');
	const filterByKeyCallback = filter(complex, 3, item => item.id);

	expect(filterByKeyValue).toEqual([{id: 3, name: 'Charlie'}]);
	expect(filterByKeyCallback).toEqual([{id: 3, name: 'Charlie'}]);

	const filterByValueCallback = filter(complex, item => item.id === 3);

	expect(filterByValueCallback).toEqual([{id: 3, name: 'Charlie'}]);
});

test('find', () => {
	const simple = [1, 2, 3, 4];

	expect(find(simple, 2)).toBe(2);
	expect(find(simple, 5)).toBeUndefined();

	const complex = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const findByKeyCallback = find(complex, item => item.id === 3);
	const findByKeyValue = find(complex, 3, 'id');

	expect(findByKeyCallback).toEqual({id: 3, name: 'Charlie'});
	expect(findByKeyValue).toEqual({id: 3, name: 'Charlie'});

	const findByValueCallback = find(complex, item => item.id === 3);

	expect(findByValueCallback).toEqual({id: 3, name: 'Charlie'});
});

test('indexOf', () => {
	const simple = [1, 2, 3, 4];

	expect(indexOf(simple, 2)).toBe(1);
	expect(indexOf(simple, 5)).toBe(-1);

	const complex = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const indexOfByKeyCallback = indexOf(complex, 3, item => item.id);
	const indexOfByKeyValue = indexOf(complex, 3, 'id');

	expect(indexOfByKeyCallback).toEqual(2);
	expect(indexOfByKeyValue).toEqual(2);

	const indexOfByValueCallback = indexOf(complex, item => item.id === 3);

	expect(indexOfByValueCallback).toEqual(2);
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

	const large = Array.from({length: 1_000}, (_, i) => i % 2 === 0);

	expect(unique(large).length).toEqual(2);

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

	const uniqueByKeyCallback = unique(complex, item => item.id);
	const uniqueByKeyValue = unique(complex, 'id');

	expect(uniqueByKeyCallback).toEqual(result);
	expect(uniqueByKeyValue).toEqual(result);
});
