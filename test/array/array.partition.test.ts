import {expect, test} from 'vitest';
import {partition} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	expect(partition(simple, 2)).toEqual([[2], [1, 3, 4, 5]]);
	expect(partition(simple, 10)).toEqual([[], simple]);

	const filterByKeyValue = partition(complex, 'id', 3);
	const filterByKeyCallback = partition(complex, item => item.id, 3);

	expect(filterByKeyValue).toEqual([
		[complex[2]],
		[complex[0], complex[1], complex[3], complex[4]],
	]);

	expect(filterByKeyCallback).toEqual([
		[complex[2]],
		[complex[0], complex[1], complex[3], complex[4]],
	]);

	const filterByValueCallback = partition(complex, item => item.id === 3);
	const filterByInvalidKey = partition(complex, 'name.length' as never);

	expect(filterByValueCallback).toEqual([
		[complex[2]],
		[complex[0], complex[1], complex[3], complex[4]],
	]);

	expect(filterByInvalidKey).toEqual([
		[],
		[complex[0], complex[1], complex[2], complex[3], complex[4]],
	]);

	expect(partition('blah' as never, 99)).toEqual([[], []]);
	expect(partition([], 99)).toEqual([[], []]);
});
