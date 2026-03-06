import {expect, test} from 'vitest';
import {drop, slice, take} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const {complex, simple} = arrayFixture;

test('drop', () => {
	expect(drop(simple, 0)).toEqual(simple);
	expect(drop(simple, 2)).toEqual([3, 4, 5]);
	expect(drop(simple, 5)).toEqual([]);
	expect(drop(simple, 10)).toEqual([]);
	expect(drop(simple, -2)).toEqual([1, 2, 3]);
	expect(drop(simple, -5)).toEqual([]);
	expect(drop(simple, -10)).toEqual([]);

	expect(drop(complex, 'id', 3)).toEqual([
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(drop(complex, item => item.id, 3)).toEqual([
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(drop(complex, item => item.age < 35)).toEqual([
		{id: 3, age: 35, name: 'Charlie'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(drop([...simple, ...simple], 3)).toEqual([4, 5, ...simple]);

	expect(drop([], 2)).toEqual([]);
	expect(drop(simple, 'blah' as never)).toEqual([]);
	expect(drop(simple, 'blah' as never, 'blah' as never)).toEqual([]);
	expect(drop('blah' as never, 2)).toEqual([]);
});

test('slice', () => {
	expect(slice(simple, 0)).toEqual([]);
	expect(slice(simple, 2)).toEqual([1, 2]);
	expect(slice(simple, 10)).toEqual(simple);
	expect(slice(simple, 1, 4)).toEqual([2, 3, 4]);
	expect(slice(simple, -2)).toEqual([4, 5]);
	expect(slice(simple, -10)).toEqual(simple);
	expect(slice(simple, -4, -1)).toEqual([2, 3, 4]);

	expect(slice([], 0)).toEqual([]);
	expect(slice('blah' as never, 0)).toEqual([]);
	expect(slice(simple, 'blah' as never, 123)).toEqual(simple);
	expect(slice(simple, 'blah' as never, 'blah' as never)).toEqual(simple);
});

test('take', () => {
	expect(take(simple, 0)).toEqual([]);
	expect(take(simple, 2)).toEqual([1, 2]);
	expect(take(simple, 5)).toEqual(simple);
	expect(take(simple, 10)).toEqual(simple);
	expect(take(simple, -2)).toEqual([4, 5]);
	expect(take(simple, -5)).toEqual(simple);
	expect(take(simple, -10)).toEqual(simple);

	expect(take(complex, 'id', 3)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
	]);

	expect(take(complex, item => item.id, 3)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
	]);

	expect(take(complex, item => item.age < 35)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
	]);

	expect(take([...simple, ...simple], 3)).toEqual([1, 2, 3]);

	expect(take([], 2)).toEqual([]);
	expect(take(simple, 'blah' as never)).toEqual(simple);
	expect(take(simple, 'blah' as never, 'blah' as never)).toEqual(simple);
	expect(take('blah' as never, 2)).toEqual([]);
});
