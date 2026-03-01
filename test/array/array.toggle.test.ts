import {expect, test} from 'vitest';
import {toggle} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	expect(toggle([], [1])).toEqual([1]);
	expect(toggle([1], [1])).toEqual([]);
	expect(toggle([1], [2])).toEqual([1, 2]);
	expect(toggle([1, 2], [])).toEqual([1, 2]);

	const complex = arrayFixture.complex.map(item => ({...item}));

	expect(toggle(complex, [{id: 3, age: 25, name: 'Charlie'}], item => item.id)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(toggle(complex, [{id: 6, age: 40, name: 'Eve'}], item => item.id)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
		{id: 6, age: 40, name: 'Eve'},
	]);

	expect(toggle(complex, [{id: 4, age: 30, name: 'Alice'}], 'id')).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 5, age: 35, name: 'David'},
		{id: 6, age: 40, name: 'Eve'},
	]);

	expect(toggle(complex, [{id: 4, age: 30, name: 'Alice'}], 'id')).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 5, age: 35, name: 'David'},
		{id: 6, age: 40, name: 'Eve'},
		{id: 4, age: 30, name: 'Alice'},
	]);

	expect(toggle('blah' as never, [1, 2, 3])).toEqual([]);
	expect(toggle([1, 2, 3], 'blah' as never)).toEqual([1, 2, 3]);
});
