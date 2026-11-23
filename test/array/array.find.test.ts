import {expect, test} from 'vite-plus/test';
import {find, findLast} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('find', () => {
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
	expect(find([1, 2, 3], [] as never, [] as never)).toBeUndefined();
});

test('findLast', () => {
	expect(findLast).toBe(find.last);

	const {complex, simple} = arrayFixture;

	expect(findLast(simple, 2)).toBe(2);
	expect(findLast(simple, 10)).toBeUndefined();

	const findByKeyCallback = findLast(complex, item => item.id === 3);
	const findByKeyValue = findLast(complex, 'id', 3);

	expect(findByKeyCallback).toEqual({id: 3, age: 35, name: 'Charlie'});
	expect(findByKeyValue).toEqual({id: 3, age: 35, name: 'Charlie'});

	const findByValueCallback = findLast(complex, item => item.id === 3);

	expect(findByValueCallback).toEqual({id: 3, age: 35, name: 'Charlie'});

	expect(findLast(complex, 'name', 'Alice')?.id).toBe(4);

	expect(findLast(complex, 'id', 99)).toBeUndefined();
	expect(findLast('blah' as never, 99)).toBeUndefined();
	expect(findLast([], 99)).toBeUndefined();
});
