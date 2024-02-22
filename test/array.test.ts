import {expect, test} from 'bun:test';
import {chunk, groupBy, unique} from '../src/js/array';

test('chunk', () => {
	const array = Array.from({length: 10}, (_, i) => i + 1);

	expect(chunk(array, 3)).toEqual([
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[10],
	]);
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
		30: [
			{name: 'Bob', age: 30},
		],
	};

	const groupedByAgeCallback = groupBy(array, item => item.age);
	const groupedByAgeKey = groupBy(array, 'age');

	expect(groupedByAgeCallback).toEqual(result);
	expect(groupedByAgeKey).toEqual(result);
	expect(groupedByAgeCallback).toEqual(groupedByAgeKey);
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
