import {expect, test} from 'vitest';
import {reverseSelect, select} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('select', () => {
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

test('reverse', () => {
	expect(select.reverse(arrayFixture.simple, item => item * 2, 4)).toEqual([4]);

	expect(
		select.reverse(
			arrayFixture.simple,
			item => item * 2,
			value => value < 5,
		),
	).toEqual([2, 4]);

	expect(select.reverse(arrayFixture.simple, item => item * 2, 4)).toEqual([4]);

	expect(reverseSelect(arrayFixture.complex, item => item.name, 'Bob')).toEqual(['Bob']);

	expect(reverseSelect(arrayFixture.complex, item => ({label: item.name}), 'label', 'Bob')).toEqual(
		[{label: 'Bob'}],
	);

	expect(
		reverseSelect(
			arrayFixture.complex,
			item => item.age,
			value => value === 30,
		),
	).toEqual([30, 30]);

	expect(
		select.reverse(
			arrayFixture.complex,
			item => item.name,
			value => value.length,
			3,
		),
	).toEqual(['Bob']);

	expect(
		reverseSelect(arrayFixture.complex, item => ({label: item.name}), [] as never, 'Bob' as never),
	).toEqual([]);

	expect(select.reverse('blah' as never, item => item, 99)).toEqual([]);
});
