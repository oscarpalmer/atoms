import {expect, test} from 'vite-plus/test';
import {last} from '../../src';
import {arrayFixture, TestArrayItem} from '../.fixtures/array.fixture';

const {complex, people, simple} = arrayFixture;

test('last', () => {
	expect(last(simple)).toBe(5);

	const lastByKeyCallback = last(complex, item => item.id === 3);
	const lastByKeyValue = last(complex, 'id', 3);

	expect(lastByKeyCallback).toEqual({id: 3, age: 35, name: 'Charlie'});
	expect(lastByKeyValue).toEqual({id: 3, age: 35, name: 'Charlie'});

	const lastByValueCallback = last(complex, item => item.id === 3);

	expect(lastByValueCallback).toEqual({id: 3, age: 35, name: 'Charlie'});

	expect(last('blah' as never)).toBeUndefined();
	expect(last(complex, 'id', 99)).toBeUndefined();
	expect(last('blah' as never, 99 as never)).toBeUndefined();
	expect(last([], 99 as never)).toBeUndefined();
});

test('last.default', () => {
	const defaultItem: TestArrayItem = {
		age: 123,
		id: 99,
		name: 'Mr. Default',
	};

	const defaultNumber = 99;

	expect(last.defaulted(simple, defaultNumber)).toBe(5);

	const lastByKeyCallback = last.defaulted(
		complex,
		defaultItem,
		item => item.id === people.charlie.id,
	);
	const lastByKeyValue = last.defaulted(complex, defaultItem, 'id', people.charlie.id);

	expect(lastByKeyCallback).toEqual(people.charlie);
	expect(lastByKeyValue).toEqual(people.charlie);

	const lastByFilter = last.defaulted(complex, defaultItem, item => item.id === people.charlie.id);

	expect(lastByFilter).toEqual(people.charlie);

	expect(last.defaulted('blah' as never, defaultNumber)).toBe(defaultNumber);
	expect(last.defaulted(complex, defaultItem, 'id', 99)).toEqual(defaultItem);
	expect(last.defaulted([], defaultNumber)).toBe(defaultNumber);
});
