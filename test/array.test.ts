import {expect, test} from 'vitest';
import {
	chunk,
	compact,
	count,
	exists,
	filter,
	find,
	flatten,
	groupBy,
	indexOf,
	insert,
	push,
	shuffle,
	sort,
	splice,
	toMap,
	toRecord,
	unique,
} from '../src/js/array';
import {getRandomInteger} from '../src/js/random';
import {diff, equal} from '../src/js/value';

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
	const array = Array.from({length: 10}, (_, i) => i + 1);

	expect(chunk(array, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);

	expect(chunk(array, 100)).toEqual([array]);
});

test('compact', () => {
	expect(compact([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, ''])).toEqual([
		0,
		1,
		2,
		3,
		false,
		4,
		'',
	]);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, ''], true)).toEqual([
		1, 2, 3, 4,
	]);
});

test('count', () => {
	expect(count(simple, 2)).toBe(1);
	expect(count(simple, 5)).toBe(0);

	const countByCallback = count(complex, item => item.id === 3);
	const countByKeyValue = count(complex, 'id', 3);
	const countByKeyCallback = count(complex, item => item.id, 3);

	expect(countByCallback).toBe(1);
	expect(countByKeyValue).toBe(1);
	expect(countByKeyCallback).toBe(1);
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
});

test('flatten', () => {
	expect(flatten([1, [2, [3, [4, [5, [6, [7, [8, [9, [10]]]]]]]]]])).toEqual([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	]);
});

test('groupBy', () => {
	const simpleResult: Record<number, Item> = {
		25: {id: 3, name: 'Charlie', age: 25},
		30: {id: 4, name: 'Alice', age: 30},
		35: {id: 5, name: 'David', age: 35},
	};

	const groupedByAgeCallback = groupBy(complex, item => item.age);
	const groupedByAgeKey = groupBy(complex, 'age');

	expect(groupedByAgeCallback).toEqual(simpleResult);
	expect(groupedByAgeKey).toEqual(simpleResult);
	expect(groupedByAgeCallback).toEqual(groupedByAgeKey);

	const blah = {
		25: 'Charlie',
		30: 'Alice',
		35: 'David',
	};

	const groupedByAgeWithNameCallback = groupBy(
		complex,
		'age',
		item => item.name,
	);

	const groupedByAgeWithNameKey = groupBy(complex, 'age', 'name');

	expect(groupedByAgeWithNameCallback).toEqual(blah);
	expect(groupedByAgeWithNameKey).toEqual(blah);
	expect(groupedByAgeWithNameCallback).toEqual(groupedByAgeWithNameKey);
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

	insert(array, 1, values);

	expect(array).toHaveLength(length + 3);
	expect(array[0]).toBe(1);
	expect(array[1]).toBe('#1');
	expect(array[length + 1]).toBe(2);
	expect(array[length + 2]).toBe(3);

	const appended = [];

	insert(appended, [1, 2, 3]);

	expect(appended).toEqual([1, 2, 3]);
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
});

test('sort: basic', () => {
	expect(sort([1])).toEqual([1]);

	expect(sort([2, 1, 3])).toEqual([1, 2, 3]);
	expect(sort([2, 1, 3], true)).toEqual([3, 2, 1]);

	expect(sort([2, 1, 3], [])).toEqual([1, 2, 3]);
	expect(sort([2, 1, 3], [], true)).toEqual([3, 2, 1]);

	expect(sort([2, 1, 3], [{} as never])).toEqual([1, 2, 3]);

	expect(sort([{id: 2}, {id: 1}, {id: 3}], 'id')).toEqual([
		{id: 1},
		{id: 2},
		{id: 3},
	]);

	expect(sort([{id: 2}, {id: 1}, {id: 3}], 'id', true)).toEqual([
		{id: 3},
		{id: 2},
		{id: 1},
	]);

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
				{direction: 'asc', value: 'lastName'},
				{} as never,
			],
			true,
		),
	).toEqual([
		{age: 48, firstName: 'C', lastName: 'C'},
		{age: 48, firstName: 'C', lastName: 'C'},
		{age: 24, firstName: 'B', lastName: 'B'},
		{age: 24, firstName: 'A', lastName: 'A'},
		{age: 24, firstName: 'A', lastName: 'B'},
	]);
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
			{direction: 'desc', value: item => item.name.last},
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
	expect(array).toHaveLength(length + 2);
	expect(array[0]).toBe(1);
	expect(array[1]).toBe('#1');
	expect(array[length + 1]).toBe(3);
});

test('toMap', () => {
	const indicedObjects = toMap(complex);
	const keyedObjects = toMap(complex, 'id');
	const callbackedObjects = toMap(complex, item => item.name);

	expect(indicedObjects).toEqual(
		new Map([
			[0, {id: 1, age: 25, name: 'Alice'}],
			[1, {id: 2, age: 30, name: 'Bob'}],
			[2, {id: 3, age: 25, name: 'Charlie'}],
			[3, {id: 4, age: 30, name: 'Alice'}],
			[4, {id: 5, age: 35, name: 'David'}],
		]),
	);

	expect(keyedObjects).toEqual(
		new Map([
			[1, {id: 1, age: 25, name: 'Alice'}],
			[2, {id: 2, age: 30, name: 'Bob'}],
			[3, {id: 3, age: 25, name: 'Charlie'}],
			[4, {id: 4, age: 30, name: 'Alice'}],
			[5, {id: 5, age: 35, name: 'David'}],
		]),
	);

	expect(callbackedObjects).toEqual(
		new Map([
			['Alice', {id: 1, age: 25, name: 'Alice'}],
			['Bob', {id: 2, age: 30, name: 'Bob'}],
			['Charlie', {id: 3, age: 25, name: 'Charlie'}],
			['Alice', {id: 4, age: 30, name: 'Alice'}],
			['David', {id: 5, age: 35, name: 'David'}],
		]),
	);

	const indicedArrays = toMap(complex, true);
	const keyedArrays = toMap(complex, 'id', true);
	const callbackedArrays = toMap(complex, item => item.name, true);

	expect(indicedArrays).toEqual(
		new Map([
			[0, [{id: 1, age: 25, name: 'Alice'}]],
			[1, [{id: 2, age: 30, name: 'Bob'}]],
			[2, [{id: 3, age: 25, name: 'Charlie'}]],
			[3, [{id: 4, age: 30, name: 'Alice'}]],
			[4, [{id: 5, age: 35, name: 'David'}]],
		]),
	);

	expect(keyedArrays).toEqual(
		new Map([
			[1, [{id: 1, age: 25, name: 'Alice'}]],
			[2, [{id: 2, age: 30, name: 'Bob'}]],
			[3, [{id: 3, age: 25, name: 'Charlie'}]],
			[4, [{id: 4, age: 30, name: 'Alice'}]],
			[5, [{id: 5, age: 35, name: 'David'}]],
		]),
	);

	expect(callbackedArrays).toEqual(
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
});

test('toRecord', () => {
	const indicedObjects = toRecord(complex);
	const keyedObjects = toRecord(complex, 'id');
	const callbackedObjects = toRecord(complex, item => item.name);

	expect(indicedObjects).toEqual({
		0: {id: 1, age: 25, name: 'Alice'},
		1: {id: 2, age: 30, name: 'Bob'},
		2: {id: 3, age: 25, name: 'Charlie'},
		3: {id: 4, age: 30, name: 'Alice'},
		4: {id: 5, age: 35, name: 'David'},
	});

	expect(keyedObjects).toEqual({
		1: {id: 1, age: 25, name: 'Alice'},
		2: {id: 2, age: 30, name: 'Bob'},
		3: {id: 3, age: 25, name: 'Charlie'},
		4: {id: 4, age: 30, name: 'Alice'},
		5: {id: 5, age: 35, name: 'David'},
	});

	expect(callbackedObjects).toEqual({
		Alice: {id: 4, age: 30, name: 'Alice'},
		Bob: {id: 2, age: 30, name: 'Bob'},
		Charlie: {id: 3, age: 25, name: 'Charlie'},
		David: {id: 5, age: 35, name: 'David'},
	});

	const indicedArrays = toRecord(complex, true);
	const keyedArrays = toRecord(complex, 'id', true);
	const callbackedArrays = toRecord(complex, item => item.name, true);

	expect(indicedArrays).toEqual({
		0: [{id: 1, age: 25, name: 'Alice'}],
		1: [{id: 2, age: 30, name: 'Bob'}],
		2: [{id: 3, age: 25, name: 'Charlie'}],
		3: [{id: 4, age: 30, name: 'Alice'}],
		4: [{id: 5, age: 35, name: 'David'}],
	});

	expect(keyedArrays).toEqual({
		1: [{id: 1, age: 25, name: 'Alice'}],
		2: [{id: 2, age: 30, name: 'Bob'}],
		3: [{id: 3, age: 25, name: 'Charlie'}],
		4: [{id: 4, age: 30, name: 'Alice'}],
		5: [{id: 5, age: 35, name: 'David'}],
	});

	expect(callbackedArrays).toEqual({
		Alice: [
			{id: 1, age: 25, name: 'Alice'},
			{id: 4, age: 30, name: 'Alice'},
		],
		Bob: [{id: 2, age: 30, name: 'Bob'}],
		Charlie: [{id: 3, age: 25, name: 'Charlie'}],
		David: [{id: 5, age: 35, name: 'David'}],
	});
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
});
