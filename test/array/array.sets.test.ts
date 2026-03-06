import {expect, test} from 'vitest';
import {difference, intersection, union} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('difference', () => {
	expect(difference(arrayFixture.simple, arrayFixture.sets.simple)).toEqual([2, 4]);

	expect(difference(arrayFixture.complex, arrayFixture.sets.complex)).toEqual([
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
	]);

	expect(difference(arrayFixture.complex, arrayFixture.sets.complex, item => item.id)).toEqual([
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
	]);

	expect(difference(arrayFixture.complex, arrayFixture.sets.complex, 'id')).toEqual([
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
	]);

	expect(difference(arrayFixture.simple, arrayFixture.simple)).toEqual([]);
	expect(difference([], arrayFixture.simple)).toEqual([]);
	expect(difference(arrayFixture.simple, [])).toEqual(arrayFixture.simple);

	expect(difference('blah' as never, 'blah' as never)).toEqual([]);
	expect(difference([1, 2, 3], 'blah' as never)).toEqual([1, 2, 3]);
});

test('intersection', () => {
	expect(intersection(arrayFixture.simple, arrayFixture.sets.simple)).toEqual([1, 3, 5]);

	expect(intersection(arrayFixture.complex, arrayFixture.sets.complex)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 3, age: 35, name: 'Charlie'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(intersection(arrayFixture.complex, arrayFixture.sets.complex, item => item.id)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 3, age: 35, name: 'Charlie'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(intersection(arrayFixture.complex, arrayFixture.sets.complex, 'id')).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 3, age: 35, name: 'Charlie'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(intersection(arrayFixture.simple, arrayFixture.simple)).toEqual(arrayFixture.simple);

	expect(intersection([], arrayFixture.simple)).toEqual([]);
	expect(intersection(arrayFixture.simple, [])).toEqual([]);

	expect(intersection('blah' as never, 'blah' as never)).toEqual([]);
	expect(intersection([1, 2, 3], 'blah' as never)).toEqual([]);
});

test('union', () => {
	expect(union(arrayFixture.simple, arrayFixture.sets.simple)).toEqual([1, 2, 3, 4, 5]);

	expect(union(arrayFixture.complex, arrayFixture.sets.complex)).toEqual(arrayFixture.complex);

	expect(union(arrayFixture.complex, arrayFixture.sets.complex, item => item.id)).toEqual(
		arrayFixture.complex,
	);

	expect(union(arrayFixture.complex, arrayFixture.sets.complex, 'id')).toEqual(
		arrayFixture.complex,
	);

	expect(union(arrayFixture.simple, arrayFixture.simple)).toEqual(arrayFixture.simple);

	expect(union([], arrayFixture.simple)).toEqual(arrayFixture.simple);
	expect(union(arrayFixture.simple, [])).toEqual(arrayFixture.simple);

	expect(union('blah' as never, 'blah' as never)).toEqual([]);
	expect(union([1, 2, 3], 'blah' as never)).toEqual([1, 2, 3]);
});
