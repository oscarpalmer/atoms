import {expect, test} from 'vite-plus/test';
import {last, lastOrDefault} from '../../src';
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

test('lastOrDefault', () => {
	expect(last.defaulted).toBe(lastOrDefault);

	const defaultItem: TestArrayItem = {
		age: 123,
		id: 99,
		name: 'Mr. Default',
	};

	const defaultNumber = 99;

	expect(lastOrDefault(simple, defaultNumber)).toBe(5);

	const lastByKeyCallback = lastOrDefault(
		complex,
		defaultItem,
		item => item.id === people.charlie.id,
	);
	const lastByKeyValue = lastOrDefault(complex, defaultItem, 'id', people.charlie.id);

	expect(lastByKeyCallback).toEqual(people.charlie);
	expect(lastByKeyValue).toEqual(people.charlie);

	const lastByFilter = lastOrDefault(complex, defaultItem, item => item.id === people.charlie.id);

	expect(lastByFilter).toEqual(people.charlie);

	expect(lastOrDefault('blah' as never, defaultNumber)).toBe(defaultNumber);
	expect(lastOrDefault(complex, defaultItem, 'id', 99)).toEqual(defaultItem);
	expect(lastOrDefault([], defaultNumber)).toBe(defaultNumber);
});
