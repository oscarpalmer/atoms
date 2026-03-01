import {expect, test} from 'vitest';
import {partition} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	expect(partition(simple, 2)).toEqual([[2], [1, 3, 4]]);
	expect(partition(simple, 5)).toEqual([[], [1, 2, 3, 4]]);

	const filterByKeyValue = partition(complex, 'id', 3);
	const filterByKeyCallback = partition(complex, item => item.id, 3);

	expect(filterByKeyValue).toEqual([
		[{id: 3, age: 25, name: 'Charlie'}],
		[
			{id: 1, age: 25, name: 'Alice'},
			{id: 2, age: 30, name: 'Bob'},
			{id: 4, age: 30, name: 'Alice'},
			{id: 5, age: 35, name: 'David'},
		],
	]);

	expect(filterByKeyCallback).toEqual([
		[{id: 3, age: 25, name: 'Charlie'}],
		[
			{id: 1, age: 25, name: 'Alice'},
			{id: 2, age: 30, name: 'Bob'},
			{id: 4, age: 30, name: 'Alice'},
			{id: 5, age: 35, name: 'David'},
		],
	]);

	const filterByValueCallback = partition(complex, item => item.id === 3);
	const filterByInvalidKey = partition(complex, 'name.length' as never);

	expect(filterByValueCallback).toEqual([
		[{id: 3, age: 25, name: 'Charlie'}],
		[
			{id: 1, age: 25, name: 'Alice'},
			{id: 2, age: 30, name: 'Bob'},
			{id: 4, age: 30, name: 'Alice'},
			{id: 5, age: 35, name: 'David'},
		],
	]);

	expect(filterByInvalidKey).toEqual([
		[],
		[
			{id: 1, age: 25, name: 'Alice'},
			{id: 2, age: 30, name: 'Bob'},
			{id: 3, age: 25, name: 'Charlie'},
			{id: 4, age: 30, name: 'Alice'},
			{id: 5, age: 35, name: 'David'},
		],
	]);

	expect(partition('blah' as never, 99)).toEqual([[], []]);
	expect(partition([], 99)).toEqual([[], []]);
});
