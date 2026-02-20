import {expect, test} from 'vitest';
import {filter} from '../../src/array';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

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
