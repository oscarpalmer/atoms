import {expect, test} from 'vitest';
import {update} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	expect(update([], [1])).toEqual([1]);
	expect(update([1], [1])).toEqual([1]);
	expect(update([1], [2])).toEqual([1, 2]);
	expect(update([1, 2], [])).toEqual([1, 2]);

	const complex = arrayFixture.complex.map(item => ({...item}));

	expect(update(complex, [{id: 3, age: 25, name: 'Charlie (updated)'}], item => item.id)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 3, age: 25, name: 'Charlie (updated)'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
	]);

	expect(update(complex, [{id: 6, age: 40, name: 'Eve'}], item => item.id)).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 3, age: 25, name: 'Charlie (updated)'},
		{id: 4, age: 30, name: 'Alice'},
		{id: 5, age: 35, name: 'David'},
		{id: 6, age: 40, name: 'Eve'},
	]);

	expect(update(complex, [{id: 4, age: 30, name: 'Alice (updated)'}], 'id')).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 3, age: 25, name: 'Charlie (updated)'},
		{id: 4, age: 30, name: 'Alice (updated)'},
		{id: 5, age: 35, name: 'David'},
		{id: 6, age: 40, name: 'Eve'},
	]);

	expect(update(complex, [{id: 4, age: 30, name: 'Alice (updated again)'}], 'id')).toEqual([
		{id: 1, age: 25, name: 'Alice'},
		{id: 2, age: 30, name: 'Bob'},
		{id: 3, age: 25, name: 'Charlie (updated)'},
		{id: 4, age: 30, name: 'Alice (updated again)'},
		{id: 5, age: 35, name: 'David'},
		{id: 6, age: 40, name: 'Eve'},
	]);

	expect(update('blah' as never, [1, 2, 3])).toEqual([]);
	expect(update([1, 2, 3], 'blah' as never)).toEqual([1, 2, 3]);
});
