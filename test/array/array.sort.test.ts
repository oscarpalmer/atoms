import {expect, test} from 'vitest';
import {diff, getRandomInteger, shuffle, sort} from '../../src';

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

test('large', () =>
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
			{
				comparison: (first, second) => first.name.last.localeCompare(second.name.last),
				direction: 'descending',
			},
			(first, second) => first.name.first.localeCompare(second.name.first),
		]);

		setTimeout(() => {
			const diffed = diff(native, atomic);

			setTimeout(() => {
				expect(diffed.type).toBe('none');

				done();
			}, 250);
		}, 250);
	}));
