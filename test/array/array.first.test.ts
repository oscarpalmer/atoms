import {expect, test} from 'vite-plus/test';
import {first, firstOrDefault} from '../../src';
import {arrayFixture, TestArrayItem} from '../.fixtures/array.fixture';

const {complex, people, simple} = arrayFixture;

test('first', () => {
	expect(first(simple)).toBe(1);

	const firstByKeyCallback = first(complex, item => item.id === people.charlie.id);
	const firstByKeyValue = first(complex, 'id', people.charlie.id);

	expect(firstByKeyCallback).toEqual(people.charlie);
	expect(firstByKeyValue).toEqual(people.charlie);

	const firstByFilter = first(complex, item => item.id === people.charlie.id);

	expect(firstByFilter).toEqual(people.charlie);

	expect(first('blah' as never)).toBeUndefined();
	expect(first(complex, 'id', 99)).toBeUndefined();
	expect(first('blah' as never, 99 as never)).toBeUndefined();
	expect(first([1, 2, 3], 99 as never)).toBeUndefined();
	expect(first([], 99 as never)).toBeUndefined();
	expect(first([1, 2, 3], [] as never)).toBeUndefined();
});

test('firstOrDefault', () => {
	expect(first.defaulted).toBe(firstOrDefault);

	const defaultItem: TestArrayItem = {
		age: 123,
		id: 99,
		name: 'Mr. Default',
	};

	const defaultNumber = 99;

	expect(firstOrDefault(simple, defaultNumber)).toBe(1);

	const firstByKeyCallback = firstOrDefault(
		complex,
		defaultItem,
		item => item.id === people.charlie.id,
	);
	const firstByKeyValue = firstOrDefault(complex, defaultItem, 'id', people.charlie.id);

	expect(firstByKeyCallback).toEqual(people.charlie);
	expect(firstByKeyValue).toEqual(people.charlie);

	const firstByFilter = firstOrDefault(complex, defaultItem, item => item.id === people.charlie.id);

	expect(firstByFilter).toEqual(people.charlie);

	expect(firstOrDefault('blah' as never, defaultNumber)).toBe(defaultNumber);
	expect(firstOrDefault(complex, defaultItem, 'id', 99)).toEqual(defaultItem);
	expect(firstOrDefault([], defaultNumber)).toBe(defaultNumber);
});
