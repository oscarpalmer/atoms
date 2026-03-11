import {expect, test} from 'vitest';
import {filter} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const {complex, simple} = arrayFixture;

test('filter', () => {
	expect(filter(simple, 2)).toEqual([2]);
	expect(filter(simple, 10)).toEqual([]);

	const filterByKeyValue = filter(complex, 'id', 3);
	const filterByKeyCallback = filter(complex, item => item.id, 3);

	expect(filterByKeyValue).toEqual([{id: 3, age: 35, name: 'Charlie'}]);
	expect(filterByKeyCallback).toEqual([{id: 3, age: 35, name: 'Charlie'}]);

	const filterByValueCallback = filter(complex, item => item.id === 3);
	const filterByInvalidKey = filter(complex, 'name.length' as never);

	expect(filterByValueCallback).toEqual([{id: 3, age: 35, name: 'Charlie'}]);
	expect(filterByInvalidKey).toEqual([]);

	expect(filter('blah' as never, 99)).toEqual([]);
	expect(filter([], 99)).toEqual([]);
});

test('remove', () => {
	expect(filter.remove(simple, 2)).toEqual([1, 3, 4, 5]);
	expect(filter.remove(simple, 10)).toEqual(simple);

	const removeByKeyValue = filter.remove(complex, 'id', 3);
	const removeByKeyCallback = filter.remove(complex, item => item.id, 3);

	expect(removeByKeyValue).toEqual([complex[0], complex[1], complex[3], complex[4]]);

	expect(removeByKeyCallback).toEqual([complex[0], complex[1], complex[3], complex[4]]);

	const removeByValueCallback = filter.remove(complex, item => item.id === 3);
	const removeByInvalidKey = filter.remove(complex, 'name.length' as never);

	expect(removeByValueCallback).toEqual([complex[0], complex[1], complex[3], complex[4]]);

	expect(removeByInvalidKey).toEqual(complex);

	expect(filter.remove('blah' as never, 99)).toEqual([]);
	expect(filter.remove([], 99)).toEqual([]);
});
