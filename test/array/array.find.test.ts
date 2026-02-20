import {expect, test} from 'vitest';
import {find} from '../../src/array';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	expect(find(simple, 2)).toBe(2);
	expect(find(simple, 5)).toBeUndefined();

	const findByKeyCallback = find(complex, item => item.id === 3);
	const findByKeyValue = find(complex, 'id', 3);

	expect(findByKeyCallback).toEqual({id: 3, age: 25, name: 'Charlie'});
	expect(findByKeyValue).toEqual({id: 3, age: 25, name: 'Charlie'});

	const findByValueCallback = find(complex, item => item.id === 3);

	expect(findByValueCallback).toEqual({id: 3, age: 25, name: 'Charlie'});

	expect(find(complex, 'id', 99)).toBeUndefined();
	expect(find('blah' as never, 99)).toBeUndefined();
	expect(find([], 99)).toBeUndefined();
});
