import {expect, test} from 'vitest';
import {
	chunk,
	compact,
	exists,
	filter,
	find,
	flatten,
	getArray,
	indexOf,
	insert,
	push,
	shuffle,
	sort,
	splice,
	toSet,
	unique,
} from '../src/array';
import {groupBy} from '../src/array/group-by';
import {toMap} from '../src/array/to-map';
import {toRecord} from '../src/array/to-record';
import {getArrayCallbacks} from '../src/internal/array/callbacks';
import {equal} from '../src/internal/value/equal';
import {getRandomInteger} from '../src/random';
import {diff} from '../src/value/diff';

type Item = {
	age: number;
	id: number;
	name: string;
};

const complex: Item[] = [
	{id: 1, age: 25, name: 'Alice'},
	{id: 2, age: 30, name: 'Bob'},
	{id: 3, age: 25, name: 'Charlie'},
	{id: 4, age: 30, name: 'Alice'},
	{id: 5, age: 35, name: 'David'},
];

const simple = [1, 2, 3, 4];

test('chunk', () => {
	const array = Array.from({length: 10_000}, (_, i) => i + 1);

	expect(chunk(array).length).toBe(2);
	expect(chunk(array, 4_000).length).toBe(3);
	expect(chunk(array, 10_000).length).toBe(2);

	expect(chunk('blah' as never)).toEqual([]);
	expect(chunk([])).toEqual([]);
});

test('compact', () => {
	expect(compact([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, ''])).toEqual([0, 1, 2, 3, false, 4, '']);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, ''], true)).toEqual([1, 2, 3, 4]);

	expect(compact('blah' as never)).toEqual([]);
});

test('exists', () => {
	expect(exists(simple, 2)).toBe(true);
	expect(exists(simple, 5)).toBe(false);

	const existsByKeyCallback = exists(complex, item => item.id, 3);
	const existsByKeyValue = exists(complex, 'id', 3);

	expect(existsByKeyCallback).toEqual(true);
	expect(existsByKeyValue).toEqual(true);

	const existsByValueCallback = exists(complex, item => item.id === 3);

	expect(existsByValueCallback).toEqual(true);

	expect(exists('blah' as never, 99)).toBe(false);
	expect(exists([], 99)).toBe(false);
});

test('filter', () => {
	expect(filter(simple, 2)).toEqual([2]);
	expect(filter(simple, 5)).toEqual([]);

	const filterByKeyValue = filter(complex, 'id', 3);
	const filterByKeyCallback = filter(complex, item => item.id, 3);

	expect(filterByKeyValue).toEqual([{id: 3, age: 25, name: 'Charlie'}]);
	expect(filterByKeyCallback).toEqual([{id: 3, age: 25, name: 'Charlie'}]);

	const filterByValueCallback = filter(complex, item => item.id === 3);

	expect(filterByValueCallback).toEqual([{id: 3, age: 25, name: 'Charlie'}]);

	const filterByInvalidKey = filter(complex, 'name.length' as never);
	expect(filterByInvalidKey).toEqual([]);

	expect(filter('blah' as never, 99)).toEqual([]);
	expect(filter([], 99)).toEqual([]);
});

test('find', () => {
	expect(find(simple, 2)).toBe(2);
	expect(find(simple, 5)).toBeUndefined();

	const findByKeyCallback = find(complex, item => item.id === 3);
	const findByKeyValue = find(complex, 'id', 3);

	expect(findByKeyCallback).toEqual({id: 3, age: 25, name: 'Charlie'});
	expect(findByKeyValue).toEqual({id: 3, age: 25, name: 'Charlie'});

	const findByValueCallback = find(complex, item => item.id === 3);

	expect(findByValueCallback).toEqual({id: 3, age: 25, name: 'Charlie'});

	expect(find(complex, 'id', 99)).toBeUndefined();

	expect(find('blah' as never, 99)).toBeUndefined();
	expect(find([], 99)).toBeUndefined();
});

test('flatten', () => {
	expect(flatten([1, [2, [3, [4, [5, [6, [7, [8, [9, [10]]]]]]]]]])).toEqual([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	]);

	expect(flatten('blah' as never)).toEqual([]);
	expect(flatten([])).toEqual([]);
});

test('getArray', () => {
	const values = [null, undefined, '', 123, true, Symbol('test'), (): void => {}];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(getArray(values[index])).toEqual([values[index]]);
	}

	expect(getArray(complex)).toEqual(complex);
	expect(getArray(simple)).toEqual(simple);

	const object = {
		123: 'one two three',
		alpha: 'omega',
		999: 'nine nine nine',
		value: {hello: 'world'},
	};

	expect(getArray(object)).toEqual(['one two three', 'nine nine nine', 'omega', {hello: 'world'}]);

	expect(getArray(object, true)).toEqual(['one two three', 'nine nine nine']);
});

test('getCallbacks', () => {
	const withBoolean = getArrayCallbacks(null, true);
	expect(withBoolean?.keyed).toBeUndefined();

	const withDotNotation = getArrayCallbacks(null, 'prop.nested');
	expect(withDotNotation?.keyed).toBeUndefined();

	const withFunction = getArrayCallbacks(() => true);
	expect(typeof withFunction?.bool).toBe('function');

	const withNumber = getArrayCallbacks(null, 123);
	expect(typeof withNumber?.keyed).toBe('function');

	const withObject = getArrayCallbacks(null, {});
	expect(withObject?.keyed).toBeUndefined();

	const withNull = getArrayCallbacks(null, null);
	expect(withNull?.keyed).toBeUndefined();

	const withString = getArrayCallbacks(null, 'id');
	expect(typeof withString?.keyed).toBe('function');

	const withUndefined = getArrayCallbacks(null, undefined);
	expect(withUndefined?.keyed).toBeUndefined();
});

test('groupBy', () => {
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

test('indexOf', () => {
	expect(indexOf(simple, 2)).toBe(1);
	expect(indexOf(simple, 5)).toBe(-1);

	const indexOfByKeyCallback = indexOf(complex, item => item.id, 3);
	const indexOfByKeyValue = indexOf(complex, 'id', 3);

	expect(indexOfByKeyCallback).toEqual(2);
	expect(indexOfByKeyValue).toEqual(2);

	const indexOfByValueCallback = indexOf(complex, item => item.id === 3);

	expect(indexOfByValueCallback).toEqual(2);

	expect(indexOf(complex, 'id', 99)).toBe(-1);

	expect(indexOf('blah' as never, 99)).toBe(-1);
	expect(indexOf([], 99)).toBe(-1);
});

test('insert', () => {
	const length = 100_000;

	const values = Array.from({length}, (_, i) => `#${i + 1}`);

	try {
		const failure: Array<number | string> = [1, 2, 3];

		failure.splice(1, 0, ...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: Array<number | string> = [1, 2, 3];

	expect(insert(array, 1, values)).toEqual([1, ...values, 2, 3]);

	expect(array).toHaveLength(length + 3);
	expect(array[0]).toBe(1);
	expect(array[1]).toBe('#1');
	expect(array[length + 1]).toBe(2);
	expect(array[length + 2]).toBe(3);

	const appended: unknown[] = [];

	expect(insert(appended, [1, 2, 3])).toEqual([1, 2, 3]);

	expect(insert('blah' as never, [])).toEqual([]);
	expect(insert([], 'blah' as never)).toEqual([]);
	expect(insert([], [])).toEqual([]);
	expect(insert([], 'blah' as never, [])).toEqual([]);
	expect(insert([], 0, 'blah' as never)).toEqual([]);
});

test('push', () => {
	const length = 100_000;

	const values = Array.from({length}, (_, i) => i + 1);

	try {
		const failure: number[] = [];

		failure.push(...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: number[] = [];

	expect(push(array, values)).toBe(length);

	expect(push('blah' as never, [])).toBe(0);
	expect(push([], 'blah' as never)).toBe(0);
	expect(push([], [])).toBe(0);
});

test('shuffle', () => {
	let first: Item[] | null = null;
	let second: Item[] | null = null;

	while (first == null || equal(first, second)) {
		first = shuffle(complex);
	}

	while (second == null || equal(second, first)) {
		second = shuffle(complex);
	}

	expect(first).not.toEqual(complex);
	expect(first).not.toEqual(second);

	expect(shuffle('blah' as never)).toEqual([]);
	expect(shuffle([])).toEqual([]);
	expect(shuffle([1])).toEqual([1]);
});

test('sort: basic', () => {
	expect(sort([1])).toEqual([1]);

	expect(sort([2, 1, 3])).toEqual([1, 2, 3]);
	expect(sort([2, 1, 3], true)).toEqual([3, 2, 1]);

	expect(sort([2, 1, 3], [])).toEqual([1, 2, 3]);
	expect(sort([2, 1, 3], [], true)).toEqual([3, 2, 1]);

	expect(sort([2, 1, 3], [{} as never])).toEqual([1, 2, 3]);

	expect(sort([{id: 2}, {id: 1}, {id: 3}], 'id')).toEqual([{id: 1}, {id: 2}, {id: 3}]);

	expect(sort([{id: 2}, {id: 1}, {id: 3}], 'id', true)).toEqual([{id: 3}, {id: 2}, {id: 1}]);

	expect(
		sort(
			[{id: 2}, {id: 1}, {id: 3}],
			[
				{
					key: 'id',
				},
			],
			true,
		),
	).toEqual([{id: 3}, {id: 2}, {id: 1}]);

	expect(
		sort(
			[{id: 2}, {id: 1}, {id: 3}],
			[
				{
					value: item => item.id,
				},
			],
			true,
		),
	).toEqual([{id: 3}, {id: 2}, {id: 1}]);

	expect(
		sort(
			[
				{age: 24, firstName: 'B', lastName: 'B'},
				{age: 48, firstName: 'C', lastName: 'C'},
				{age: 24, firstName: 'A', lastName: 'B'},
				{age: 24, firstName: 'A', lastName: 'A'},
				{age: 48, firstName: 'C', lastName: 'C'},
			],
			[
				item => item.age,
				'firstName',
				{direction: 'blah' as never, key: 'lastName'},
				{direction: 'ascending', key: 'lastName'},
				{} as never,
			],
			true,
		),
	).toEqual([
		{age: 48, firstName: 'C', lastName: 'C'},
		{age: 48, firstName: 'C', lastName: 'C'},
		{age: 24, firstName: 'B', lastName: 'B'},
		{age: 24, firstName: 'A', lastName: 'B'},
		{age: 24, firstName: 'A', lastName: 'A'},
	]);

	expect(sort('blah' as never)).toEqual([]);
});

test('sort: compare', () => {
	const greek = [
		'Alpha',
		'Beta',
		'Gamma',
		'Delta',
		'Epsilon',
		'Zeta',
		'Eta',
		'Theta',
		'Iota',
		'Kappa',
		'Lambda',
		'Mu',
		'Nu',
		'Xi',
		'Omicron',
		'Pi',
		'Rho',
		'Sigma',
		'Tau',
		'Upsilon',
		'Phi',
		'Chi',
		'Psi',
		'Omega',
	];

	const values = shuffle(greek).map((value, index) => ({
		value,
		id: index + 1,
	}));

	expect(sort([...values]).map(item => item.value)).not.toEqual(greek);

	expect(
		sort(
			[...values],
			[
				{
					// Hi, Claude: first and second are always `any`
					compare: (_, first, __, second) =>
						greek.indexOf(first as never) - greek.indexOf(second as never),
					key: 'value',
				},
			],
		).map(item => item.value),
	).toEqual(greek);

	expect(
		sort(
			[...values],
			[
				{
					// Hi again, Claude: first and second are still always `any`
					compare: (_, first, __, second) =>
						greek.indexOf(first as never) - greek.indexOf(second as never),
					direction: 'descending',
					value: item => item.value,
				},
			],
		).map(item => item.value),
	).toEqual([...greek].reverse());
});

test('sort: large', () =>
	new Promise<void>(done => {
		const firstNames = ['Alice', 'Bob', 'Charlie', 'David'];
		const lastNames = ['Avery', 'Baker', 'Charlie', 'Davidson'];

		const large = Array.from({length: 100_000}, (_, index) => ({
			id: index + 1,
			age: getRandomInteger(24, 48),
			name: {
				first: firstNames[index % 4],
				last: lastNames[index % 4],
			},
		}));

		const native = large.slice().sort((first, second) => {
			const age = first.age - second.age;

			if (age !== 0) {
				return age;
			}

			const lastName = second.name.last.localeCompare(first.name.last);

			if (lastName !== 0) {
				return lastName;
			}

			return first.name.first.localeCompare(second.name.first);
		});

		const atomic = sort(large, [
			'age',
			{direction: 'descending', value: item => item.name.last},
			item => item.name.first,
		]);

		setTimeout(() => {
			const diffed = diff(native, atomic);

			setTimeout(() => {
				expect(diffed.type).toBe('none');

				done();
			}, 250);
		}, 250);
	}));

test('splice', () => {
	const length = 100_000;

	const values = Array.from({length}, (_, i) => `#${i + 1}`);

	try {
		const failure: Array<number | string> = [1, 2, 3];

		failure.splice(1, 1, ...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: Array<number | string> = [1, 2, 3];

	expect(splice(array, 1, 1, values)).toEqual([2]);
	expect(splice(array, 0, -99)).toEqual([]);
	expect(array).toHaveLength(length + 2);
	expect(array[0]).toBe(1);
	expect(array[1]).toBe('#1');
	expect(array[length + 1]).toBe(3);

	expect(splice('blah' as never, 0)).toEqual([]);
	expect(splice([], 'blah' as never)).toEqual([]);
	expect(splice([], 0, [])).toEqual([]);
	expect(splice([], 0, 'blah' as never)).toEqual([]);

	const x = Array.from({length: 7777}, (_, i) => i + 1);
	const y: unknown[] = [];

	expect(splice(y, 0, -1, x)).toEqual([]);
	expect(y).toEqual(x);
});

test('toMap', () => {
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

test('toRecord', () => {
	const indiced = toRecord(complex);
	const keyed = toRecord(complex, 'id');
	const callbacked = toRecord(complex, item => item.name);

	expect(indiced).toEqual({
		0: {id: 1, age: 25, name: 'Alice'},
		1: {id: 2, age: 30, name: 'Bob'},
		2: {id: 3, age: 25, name: 'Charlie'},
		3: {id: 4, age: 30, name: 'Alice'},
		4: {id: 5, age: 35, name: 'David'},
	});

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

	const keyToKey = toRecord(complex, 'id', 'name');
	const valueToKey = toRecord(complex, item => item.name, 'age');
	const keyToValue = toRecord(complex, 'name', item => item.age);
	const valueToValue = toRecord(
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

	const keyeds = toRecord.arrays(complex, 'id');
	const callbackeds = toRecord.arrays(complex, item => item.name);

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

	const keyToKeys = toRecord.arrays(complex, 'id', 'name');
	const valueToKeys = toRecord.arrays(complex, item => item.name, 'age');
	const keyToValues = toRecord.arrays(complex, 'name', item => item.age);
	const valueToValues = toRecord.arrays(
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
});

test('toSet', () => {
	const simple = toSet(complex);
	const keyed = toSet(complex, 'id');
	const callbacked = toSet(complex, item => item.name);

	expect(simple).toEqual(new Set(complex));

	expect(keyed).toEqual(new Set([1, 2, 3, 4, 5]));

	expect(callbacked).toEqual(new Set(['Alice', 'Bob', 'Charlie', 'Alice', 'David']));

	expect(toSet(complex, [] as never)).toEqual(new Set(complex));
	expect(toSet('blah' as never)).toEqual(new Set());
});

test('unique', () => {
	const simple = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];

	expect(unique(simple)).toEqual([1, 2, 3, 4]);

	const large = Array.from({length: 1_000}, (_, i) => i % 2 === 0);

	expect(unique(large).length).toEqual(2);

	const complex = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 3, name: 'Charlie'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const result = [
		{id: 1, name: 'Alice'},
		{id: 2, name: 'Bob'},
		{id: 3, name: 'Charlie'},
		{id: 4, name: 'David'},
	];

	const uniqueByKeyCallback = unique(complex, item => item.id);
	const uniqueByKeyValue = unique(complex, 'id');

	expect(uniqueByKeyCallback).toEqual(result);
	expect(uniqueByKeyValue).toEqual(result);

	expect(unique('blah' as never)).toEqual([]);
	expect(unique([])).toEqual([]);
	expect(unique([1])).toEqual([1]);
});
