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
			[0, {id: 1, age: 25, name: 'Alice'}],
			[1, {id: 2, age: 30, name: 'Bob'}],
			[2, {id: 3, age: 25, name: 'Charlie'}],
			[3, {id: 4, age: 30, name: 'Alice'}],
			[4, {id: 5, age: 35, name: 'David'}],
		]),
	);

	expect(keyed).toEqual(
		new Map([
			[1, {id: 1, age: 25, name: 'Alice'}],
			[2, {id: 2, age: 30, name: 'Bob'}],
			[3, {id: 3, age: 25, name: 'Charlie'}],
			[4, {id: 4, age: 30, name: 'Alice'}],
			[5, {id: 5, age: 35, name: 'David'}],
		]),
	);

	expect(callbacked).toEqual(
		new Map([
			['Alice', {id: 1, age: 25, name: 'Alice'}],
			['Bob', {id: 2, age: 30, name: 'Bob'}],
			['Charlie', {id: 3, age: 25, name: 'Charlie'}],
			['Alice', {id: 4, age: 30, name: 'Alice'}],
			['David', {id: 5, age: 35, name: 'David'}],
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
			[1, 'Alice'],
			[2, 'Bob'],
			[3, 'Charlie'],
			[4, 'Alice'],
			[5, 'David'],
		]),
	);

	expect(valueToKey).toEqual(
		new Map([
			['Alice', 30],
			['Bob', 30],
			['Charlie', 25],
			['David', 35],
		]),
	);

	expect(keyToValue).toEqual(valueToKey);
	expect(valueToValue).toEqual(valueToKey);

	const keyeds = toMap.arrays(complex, 'id');
	const callbackeds = toMap.arrays(complex, item => item.name);

	expect(keyeds).toEqual(
		new Map([
			[1, [{id: 1, age: 25, name: 'Alice'}]],
			[2, [{id: 2, age: 30, name: 'Bob'}]],
			[3, [{id: 3, age: 25, name: 'Charlie'}]],
			[4, [{id: 4, age: 30, name: 'Alice'}]],
			[5, [{id: 5, age: 35, name: 'David'}]],
		]),
	);

	expect(callbackeds).toEqual(
		new Map([
			[
				'Alice',
				[
					{id: 1, age: 25, name: 'Alice'},
					{id: 4, age: 30, name: 'Alice'},
				],
			],
			['Bob', [{id: 2, age: 30, name: 'Bob'}]],
			['Charlie', [{id: 3, age: 25, name: 'Charlie'}]],
			['David', [{id: 5, age: 35, name: 'David'}]],
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
			[1, ['Alice']],
			[2, ['Bob']],
			[3, ['Charlie']],
			[4, ['Alice']],
			[5, ['David']],
		]),
	);

	expect(valueToKeys).toEqual(
		new Map([
			['Alice', [25, 30]],
			['Bob', [30]],
			['Charlie', [25]],
			['David', [35]],
		]),
	);

	expect(keyToValues).toEqual(valueToKeys);
	expect(valueToValues).toEqual(valueToKeys);

	expect(toMap('blah' as never)).toEqual(new Map());
});
