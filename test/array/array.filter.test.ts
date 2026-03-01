import {expect, test} from 'vitest';
import {filter} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const {complex, simple} = arrayFixture;

test('filter', () => {
	expect(filter(simple, 2)).toEqual([2]);
	expect(filter(simple, 5)).toEqual([]);

	const filterByKeyValue = filter(complex, 'id', 3);
	const filterByKeyCallback = filter(complex, item => item.id, 3);

	expect(filterByKeyValue).toEqual([{id: 3, age: 25, name: 'Charlie'}]);
	expect(filterByKeyCallback).toEqual([{id: 3, age: 25, name: 'Charlie'}]);

	const filterByValueCallback = filter(complex, item => item.id === 3);
	const filterByInvalidKey = filter(complex, 'name.length' as never);

	expect(filterByValueCallback).toEqual([{id: 3, age: 25, name: 'Charlie'}]);
	expect(filterByInvalidKey).toEqual([]);

	expect(filter('blah' as never, 99)).toEqual([]);
	expect(filter([], 99)).toEqual([]);
});

test('remove', () => {
	expect(filter.remove(simple, 2)).toEqual([1, 3, 4]);
	expect(filter.remove(simple, 5)).toEqual([1, 2, 3, 4]);

	const removeByKeyValue = filter.remove(complex, 'id', 3);
	const removeByKeyCallback = filter.remove(complex, item => item.id, 3);

	expect(removeByKeyValue).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(removeByKeyCallback).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	const removeByValueCallback = filter.remove(complex, item => item.id === 3);
	const removeByInvalidKey = filter.remove(complex, 'name.length' as never);

	expect(removeByValueCallback).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(removeByInvalidKey).toEqual(complex);

	expect(filter.remove('blah' as never, 99)).toEqual([]);
	expect(filter.remove([], 99)).toEqual([]);
});
