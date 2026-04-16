import {expect, test} from 'vitest';
import {first} from '../../src';
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
	expect(first([], 99 as never)).toBeUndefined();
});

test('first.default', () => {
	const defaultItem: TestArrayItem = {
		age: 123,
		id: 99,
		name: 'Mr. Default',
	};

	const defaultNumber = 99;

	expect(first.default(simple, defaultNumber)).toBe(1);

	const firstByKeyCallback = first.default(
		complex,
		defaultItem,
		item => item.id === people.charlie.id,
	);
	const firstByKeyValue = first.default(complex, defaultItem, 'id', people.charlie.id);

	expect(firstByKeyCallback).toEqual(people.charlie);
	expect(firstByKeyValue).toEqual(people.charlie);

	const firstByFilter = first.default(complex, defaultItem, item => item.id === people.charlie.id);

	expect(firstByFilter).toEqual(people.charlie);

	expect(first.default('blah' as never, defaultNumber)).toBe(defaultNumber);
	expect(first.default(complex, defaultItem, 'id', 99)).toEqual(defaultItem);
	expect(first.default([], defaultNumber)).toBe(defaultNumber);
});
