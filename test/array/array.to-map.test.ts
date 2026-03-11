import {expect, test} from 'vitest';
import {toMap} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex} = arrayFixture;

	const indiced = toMap(complex);
	const keyed = toMap(complex, 'id');
	const callbacked = toMap(complex, item => item.name);

	expect(indiced).toEqual(
		new Map([
			[0, complex[0]],
			[1, complex[1]],
			[2, complex[2]],
			[3, complex[3]],
			[4, complex[4]],
		]),
	);

	expect(keyed).toEqual(
		new Map([
			[1, complex[0]],
			[2, complex[1]],
			[3, complex[2]],
			[4, complex[3]],
			[5, complex[4]],
		]),
	);

	expect(callbacked).toEqual(
		new Map([
			[complex[0].name, complex[0]],
			[complex[1].name, complex[1]],
			[complex[2].name, complex[2]],
			[complex[3].name, complex[3]],
			[complex[4].name, complex[4]],
		]),
	);

	const keyToKey = toMap(complex, 'id', 'name');
	const valueToKey = toMap(complex, item => item.name, 'age');
	const keyToValue = toMap(complex, 'name', item => item.age);

	const valueToValue = toMap(
		complex,
		item => item.name,
		item => item.age,
	);

	expect(keyToKey).toEqual(
		new Map([
			[1, complex[0].name],
			[2, complex[1].name],
			[3, complex[2].name],
			[4, complex[3].name],
			[5, complex[4].name],
		]),
	);

	expect(valueToKey).toEqual(
		new Map([
			[complex[0].name, complex[0].age],
			[complex[1].name, complex[1].age],
			[complex[2].name, complex[2].age],
			[complex[3].name, complex[3].age],
			[complex[4].name, complex[4].age],
		]),
	);

	expect(keyToValue).toEqual(valueToKey);
	expect(valueToValue).toEqual(valueToKey);

	const keyeds = toMap.arrays(complex, 'id');
	const callbackeds = toMap.arrays(complex, item => item.name);

	expect(keyeds).toEqual(
		new Map([
			[1, [complex[0]]],
			[2, [complex[1]]],
			[3, [complex[2]]],
			[4, [complex[3]]],
			[5, [complex[4]]],
		]),
	);

	expect(callbackeds).toEqual(
		new Map([
			[complex[0].name, [complex[0], complex[3]]],
			[complex[1].name, [complex[1]]],
			[complex[2].name, [complex[2]]],
			[complex[4].name, [complex[4]]],
		]),
	);

	const keyToKeys = toMap.arrays(complex, 'id', 'name');
	const valueToKeys = toMap.arrays(complex, item => item.name, 'age');
	const keyToValues = toMap.arrays(complex, 'name', item => item.age);

	const valueToValues = toMap.arrays(
		complex,
		item => item.name,
		item => item.age,
	);

	expect(keyToKeys).toEqual(
		new Map([
			[complex[0].id, [complex[0].name]],
			[complex[1].id, [complex[1].name]],
			[complex[2].id, [complex[2].name]],
			[complex[3].id, [complex[3].name]],
			[complex[4].id, [complex[4].name]],
		]),
	);

	expect(valueToKeys).toEqual(
		new Map([
			[complex[0].name, [complex[0].age, complex[3].age]],
			[complex[1].name, [complex[1].age]],
			[complex[2].name, [complex[2].age]],
			[complex[4].name, [complex[4].age]],
		]),
	);

	expect(keyToValues).toEqual(valueToKeys);
	expect(valueToValues).toEqual(valueToKeys);

	expect(toMap('blah' as never)).toEqual(new Map());
});
