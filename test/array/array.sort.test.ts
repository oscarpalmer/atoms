import {expect, test} from 'vitest';
import {diff, getRandomInteger, shuffle, sort, times} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('basic', () => {
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
					comparison: (first, second) => first.id - second.id,
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
				(first, second) => first.age - second.age,
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

test('compare', () => {
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
					compare: (_, first, __, second) => greek.indexOf(first) - greek.indexOf(second),
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
					comparison: (first, second) => greek.indexOf(first.value) - greek.indexOf(second.value),
					direction: 'descending',
				},
			],
		).map(item => item.value),
	).toEqual([...greek].reverse());
});

test('index', () => {
	const numbers = [
		[1, 2, 3, 4, 5],
		[5, 4, 3, 2, 1],
		[3, 1, 4, 5, 2],
	];

	let result = [
		[3, 0],
		[0, 3],
		[5, 4],
	];

	let {length} = numbers;

	for (let index = 0; index < length; index += 1) {
		expect(sort.index(numbers[index], 3)).toBe(result[index][0]);
		expect(sort.index(numbers[index], 3, true)).toBe(result[index][1]);
	}

	const {alice, aliceAgain, bob, charlie, david} = arrayFixture.people;

	const people = [
		[alice, bob, charlie, david],
		[david, charlie, bob, alice],
		[charlie, alice, david, bob],
	];

	result = [
		[1, 0],
		[0, 3],
		[0, 4],
	];

	let sorters: unknown[] = [{key: 'age'}, {key: 'name'}];

	for (let index = 0; index < length; index += 1) {
		expect(sort.index(people[index], aliceAgain, sorters as never)).toBe(result[index][0]);
		expect(sort.index(people[index], aliceAgain, sorters as never, true)).toBe(result[index][1]);
	}

	result = [
		[2, 0],
		[0, 3],
		[0, 4],
	];

	sorters = [{key: 'age'}, {direction: 'descending', key: 'name'}];

	for (let index = 0; index < length; index += 1) {
		expect(sort.index(people[index], aliceAgain, sorters as never)).toBe(result[index][0]);
		expect(sort.index(people[index], aliceAgain, sorters as never, true)).toBe(result[index][1]);
	}

	expect(sort.index('blah' as never, 3)).toBe(-1);
	expect(sort.index([], 3)).toBe(0);
});

test('is', () => {
	const numbers = [
		[1, 2, 3, 3, 4, 5],
		[1, 2, 3, 3, 5, 4],
		[5, 4, 3, 3, 2, 1],
	];

	let {length} = numbers;

	for (let index = 0; index < length; index += 1) {
		expect(sort.is(numbers[index])).toBe(index === 0);
		expect(sort.is(numbers[index], true)).toBe(index === length - 1);
	}

	const {alice, aliceAgain, bob, charlie, david} = arrayFixture.people;

	const people = [
		[alice, aliceAgain, bob, charlie, david],
		[alice, bob, aliceAgain, david, charlie],
		[david, charlie, bob, aliceAgain, alice],
	];

	let result = [true, false, false];
	let sorters: unknown[] = [{key: 'age'}, {key: 'name'}];

	let sorter = sort.initialize(sorters as never);

	length = people.length;

	for (let index = 0; index < length; index += 1) {
		expect(sort.is(people[index], sorters as never)).toBe(result[index]);
		expect(sorter.is(people[index])).toBe(result[index]);
	}

	result = [false, false, true];

	sorter = sort.initialize(sorters as never, true);

	for (let index = 0; index < length; index += 1) {
		expect(sort.is(people[index], sorters as never, true)).toBe(result[index]);
		expect(sorter.is(people[index])).toBe(result[index]);
	}

	result = [false, true, false];
	sorters = [{key: 'age'}, {direction: 'descending', key: 'name'}];

	sorter = sort.initialize(sorters as never);

	for (let index = 0; index < length; index += 1) {
		expect(sort.is(people[index], sorters as never)).toBe(result[index]);
		expect(sorter.is(people[index])).toBe(result[index]);
	}

	const large = [times(200, index => index), times(200, index => 200 - index)];

	length = large.length;

	for (let index = 0; index < length; index += 1) {
		expect(sort.is(large[index])).toBe(index === 0);
		expect(sort.is(large[index], true)).toBe(index === length - 1);
	}

	const larger = [times(10_000, index => index), times(10_000, index => 10_000 - index)];

	length = larger.length;

	for (let index = 0; index < length; index += 1) {
		expect(sort.is(larger[index])).toBe(index === 0);
		expect(sort.is(larger[index], true)).toBe(index === length - 1);
	}

	expect(sort.is([])).toBe(true);
	expect(sort.is([], true)).toBe(true);
	expect(sort.is('blah' as never)).toBe(false);
	expect(sort.is('blah' as never, true)).toBe(false);
});

test('large (with intializer)', () =>
	new Promise<void>(done => {
		const firstNames = ['Alice', 'Bob', 'Charlie', 'David'];
		const lastNames = ['Avery', 'Baker', 'Charlie', 'Davidson'];

		const large = times(100_000, index => ({
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

		const sorter = sort.initialize<(typeof large)[0]>([
			'age',
			{
				comparison: (first, second) => first.name.last.localeCompare(second.name.last),
				direction: 'descending',
			},
			(first, second) => first.name.first.localeCompare(second.name.first),
		]);

		const atomic = sorter(large);

		setTimeout(() => {
			const diffed = diff(native, atomic);

			setTimeout(() => {
				expect(diffed.type).toBe('none');

				done();
			}, 250);
		}, 250);
	}));
