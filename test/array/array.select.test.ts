import {expect, test} from 'vitest';
import {arrayFixture} from '../.fixtures/array.fixture';
import {select} from '../../src';

test('', () => {
	expect(select(arrayFixture.simple, 2, item => item * 2)).toEqual([4]);

	expect(
		select(
			arrayFixture.simple,
			item => item < 3,
			item => item * 2,
		),
	).toEqual([2, 4]);

	expect(select(arrayFixture.complex, 'id', 3, item => item.age)).toEqual([35]);
	expect(select(arrayFixture.complex, 'id', 3, 'age')).toEqual([35]);

	expect(
		select(
			arrayFixture.complex,
			item => item.id,
			3,
			item => item.age,
		),
	).toEqual([35]);

	expect(select(arrayFixture.complex, item => item.id, 3, 'age')).toEqual([35]);

	expect(select('blah' as never, 99, item => item)).toEqual([]);
});
