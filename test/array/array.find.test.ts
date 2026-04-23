import {expect, test} from 'vitest';
import {find} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('first', () => {
	const {complex, simple} = arrayFixture;

	expect(find(simple, 2)).toBe(2);
	expect(find(simple, 10)).toBeUndefined();

	const findByKeyCallback = find(complex, item => item.id === 3);
	const findByKeyValue = find(complex, 'id', 3);

	expect(findByKeyCallback).toEqual({id: 3, age: 35, name: 'Charlie'});
	expect(findByKeyValue).toEqual({id: 3, age: 35, name: 'Charlie'});

	const findByValueCallback = find(complex, item => item.id === 3);

	expect(findByValueCallback).toEqual({id: 3, age: 35, name: 'Charlie'});

	expect(find(complex, 'name', 'Alice')?.id).toBe(1);

	expect(find(complex, 'id', 99)).toBeUndefined();
	expect(find('blah' as never, 99)).toBeUndefined();
	expect(find([], 99)).toBeUndefined();
});

test('first', () => {
	const {complex, simple} = arrayFixture;

	expect(find.last(simple, 2)).toBe(2);
	expect(find.last(simple, 10)).toBeUndefined();

	const findByKeyCallback = find.last(complex, item => item.id === 3);
	const findByKeyValue = find.last(complex, 'id', 3);

	expect(findByKeyCallback).toEqual({id: 3, age: 35, name: 'Charlie'});
	expect(findByKeyValue).toEqual({id: 3, age: 35, name: 'Charlie'});

	const findByValueCallback = find.last(complex, item => item.id === 3);

	expect(findByValueCallback).toEqual({id: 3, age: 35, name: 'Charlie'});

	expect(find.last(complex, 'name', 'Alice')?.id).toBe(4);

	expect(find.last(complex, 'id', 99)).toBeUndefined();
	expect(find.last('blah' as never, 99)).toBeUndefined();
	expect(find.last([], 99)).toBeUndefined();
});
