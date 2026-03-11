import {expect, test} from 'vitest';
import {groupBy} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex} = arrayFixture;

	const keyed = groupBy(complex, 'id');
	const callbacked = groupBy(complex, item => item.name);

	expect(keyed).toEqual({
		1: complex[0],
		2: complex[1],
		3: complex[2],
		4: complex[3],
		5: complex[4],
	});

	expect(callbacked).toEqual({
		Alice: complex[3],
		Bob: complex[1],
		Charlie: complex[2],
		David: complex[4],
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
		Charlie: 35,
		David: 35,
	});

	expect(keyToValue).toEqual(valueToKey);
	expect(valueToValue).toEqual(valueToKey);

	const keyeds = groupBy.arrays(complex, 'id');
	const callbackeds = groupBy.arrays(complex, item => item.name);

	expect(keyeds).toEqual({
		1: [complex[0]],
		2: [complex[1]],
		3: [complex[2]],
		4: [complex[3]],
		5: [complex[4]],
	});

	expect(callbackeds).toEqual({
		Alice: [complex[0], complex[3]],
		Bob: [complex[1]],
		Charlie: [complex[2]],
		David: [complex[4]],
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
		1: [complex[0].name],
		2: [complex[1].name],
		3: [complex[2].name],
		4: [complex[3].name],
		5: [complex[4].name],
	});

	expect(valueToKeys).toEqual({
		Alice: [25, 30],
		Bob: [30],
		Charlie: [35],
		David: [35],
	});

	expect(keyToValues).toEqual(valueToKeys);
	expect(valueToValues).toEqual(valueToKeys);

	expect(groupBy('blah' as never, 'x')).toEqual({});
	expect(groupBy([], 'x')).toEqual({});
});
