import {expect, test} from 'vite-plus/test';
import {toRecord, toRecordArrays} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('toRecord', () => {
	expect(toRecord.arrays).toBe(toRecordArrays);

	const {complex} = arrayFixture;

	const indiced = toRecord(complex);
	const keyed = toRecord(complex, 'id');
	const callbacked = toRecord(complex, item => item.name);

	expect(indiced).toEqual({
		0: complex[0],
		1: complex[1],
		2: complex[2],
		3: complex[3],
		4: complex[4],
	});

	expect(keyed).toEqual({
		[complex[0].id]: complex[0],
		[complex[1].id]: complex[1],
		[complex[2].id]: complex[2],
		[complex[3].id]: complex[3],
		[complex[4].id]: complex[4],
	});

	expect(callbacked).toEqual({
		[complex[0].name]: complex[0],
		[complex[1].name]: complex[1],
		[complex[2].name]: complex[2],
		[complex[3].name]: complex[3],
		[complex[4].name]: complex[4],
	});

	const keyToKey = toRecord(complex, 'id', 'name');
	const valueToKey = toRecord(complex, item => item.name, 'age');
	const keyToValue = toRecord(complex, 'name', item => item.age);

	const valueToValue = toRecord(
		complex,
		item => item.name,
		item => item.age,
	);

	expect(keyToKey).toEqual({
		[complex[0].id]: complex[0].name,
		[complex[1].id]: complex[1].name,
		[complex[2].id]: complex[2].name,
		[complex[3].id]: complex[3].name,
		[complex[4].id]: complex[4].name,
	});

	expect(valueToKey).toEqual({
		Alice: 30,
		Bob: 30,
		Charlie: 35,
		David: 35,
	});

	expect(keyToValue).toEqual(valueToKey);
	expect(valueToValue).toEqual(valueToKey);

	const keyeds = toRecordArrays(complex, 'id');
	const callbackeds = toRecordArrays(complex, item => item.name);

	expect(keyeds).toEqual({
		[complex[0].id]: [complex[0]],
		[complex[1].id]: [complex[1]],
		[complex[2].id]: [complex[2]],
		[complex[3].id]: [complex[3]],
		[complex[4].id]: [complex[4]],
	});

	expect(callbackeds).toEqual({
		[complex[0].name]: [complex[0], complex[3]],
		[complex[1].name]: [complex[1]],
		[complex[2].name]: [complex[2]],
		[complex[4].name]: [complex[4]],
	});

	const keyToKeys = toRecordArrays(complex, 'id', 'name');
	const valueToKeys = toRecordArrays(complex, item => item.name, 'age');
	const keyToValues = toRecordArrays(complex, 'name', item => item.age);

	const valueToValues = toRecordArrays(
		complex,
		item => item.name,
		item => item.age,
	);

	expect(keyToKeys).toEqual({
		[complex[0].id]: [complex[0].name],
		[complex[1].id]: [complex[1].name],
		[complex[2].id]: [complex[2].name],
		[complex[3].id]: [complex[3].name],
		[complex[4].id]: [complex[4].name],
	});

	expect(valueToKeys).toEqual({
		[complex[0].name]: [complex[0].age, complex[3].age],
		[complex[1].name]: [complex[1].age],
		[complex[2].name]: [complex[2].age],
		[complex[4].name]: [complex[4].age],
	});

	expect(keyToValues).toEqual(valueToKeys);
	expect(valueToValues).toEqual(valueToKeys);
});
