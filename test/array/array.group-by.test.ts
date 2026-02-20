import {expect, test} from 'vitest';
import {groupBy} from '../../src/array';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex} = arrayFixture;

	const keyed = groupBy(complex, 'id');
	const callbacked = groupBy(complex, item => item.name);

	expect(keyed).toEqual({
		1: {id: 1, age: 25, name: 'Alice'},
		2: {id: 2, age: 30, name: 'Bob'},
		3: {id: 3, age: 25, name: 'Charlie'},
		4: {id: 4, age: 30, name: 'Alice'},
		5: {id: 5, age: 35, name: 'David'},
	});

	expect(callbacked).toEqual({
		Alice: {id: 4, age: 30, name: 'Alice'},
		Bob: {id: 2, age: 30, name: 'Bob'},
		Charlie: {id: 3, age: 25, name: 'Charlie'},
		David: {id: 5, age: 35, name: 'David'},
	});

	const keyToKey = groupBy(complex, 'id', 'name');
	const valueToKey = groupBy(complex, item => item.name, 'age');
	const keyToValue = groupBy(complex, 'name', item => item.age);

	const valueToValue = groupBy(
		complex,
		item => item.name,
		item => item.age,
	);

	expect(keyToKey).toEqual({
		1: 'Alice',
		2: 'Bob',
		3: 'Charlie',
		4: 'Alice',
		5: 'David',
	});

	expect(valueToKey).toEqual({
		Alice: 30,
		Bob: 30,
		Charlie: 25,
		David: 35,
	});

	expect(keyToValue).toEqual(valueToKey);
	expect(valueToValue).toEqual(valueToKey);

	const keyeds = groupBy.arrays(complex, 'id');
	const callbackeds = groupBy.arrays(complex, item => item.name);

	expect(keyeds).toEqual({
		1: [{id: 1, age: 25, name: 'Alice'}],
		2: [{id: 2, age: 30, name: 'Bob'}],
		3: [{id: 3, age: 25, name: 'Charlie'}],
		4: [{id: 4, age: 30, name: 'Alice'}],
		5: [{id: 5, age: 35, name: 'David'}],
	});

	expect(callbackeds).toEqual({
		Alice: [
			{id: 1, age: 25, name: 'Alice'},
			{id: 4, age: 30, name: 'Alice'},
		],
		Bob: [{id: 2, age: 30, name: 'Bob'}],
		Charlie: [{id: 3, age: 25, name: 'Charlie'}],
		David: [{id: 5, age: 35, name: 'David'}],
	});

	const keyToKeys = groupBy.arrays(complex, 'id', 'name');
	const valueToKeys = groupBy.arrays(complex, item => item.name, 'age');
	const keyToValues = groupBy.arrays(complex, 'name', item => item.age);

	const valueToValues = groupBy.arrays(
		complex,
		item => item.name,
		item => item.age,
	);

	expect(keyToKeys).toEqual({
		1: ['Alice'],
		2: ['Bob'],
		3: ['Charlie'],
		4: ['Alice'],
		5: ['David'],
	});

	expect(valueToKeys).toEqual({
		Alice: [25, 30],
		Bob: [30],
		Charlie: [25],
		David: [35],
	});

	expect(keyToValues).toEqual(valueToKeys);
	expect(valueToValues).toEqual(valueToKeys);

	expect(groupBy('blah' as never, 'x')).toEqual({});
	expect(groupBy([], 'x')).toEqual({});
});
