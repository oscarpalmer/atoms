import {expect, test} from 'vitest';
import * as Sized from '../src/sized';

const actualMax = 2 ** 24;
const niceMax = 2 ** 20;

function joinMap(map: Map<unknown, unknown>): string {
	return [...map.entries()].map(([key, value]) => `${key}:${value}`).join('; ');
}

function joinSet(set: Set<unknown>): string {
	return [...set.values()].join('; ');
}

test('SizedMap', () =>
	new Promise<void>(done => {
		const entriesMap = new Sized.SizedMap([
			[0, 'a'],
			[1, 'b'],
			[2, 'c'],
		]);

		const maxMap = new Sized.SizedMap(2);

		const shrunkMap = new Sized.SizedMap(
			[
				[0, 'a'],
				[1, 'b'],
				[2, 'c'],
				[3, 'd'],
				[4, 'e'],
			],
			3,
		);

		const clampedMap = new Sized.SizedMap(actualMax + 1);

		expect(entriesMap.full).toBe(false);
		expect(entriesMap.maximum).toBe(niceMax);
		expect(entriesMap.size).toBe(3);
		expect(joinMap(entriesMap)).toBe('0:a; 1:b; 2:c');
		expect(entriesMap.get(123)).toBeUndefined();

		expect(maxMap.full).toBe(false);
		expect(maxMap.maximum).toBe(2);
		expect(maxMap.size).toBe(0);
		expect(joinMap(maxMap)).toBe('');

		expect(shrunkMap.full).toBe(true);
		expect(shrunkMap.maximum).toBe(3);
		expect(shrunkMap.size).toBe(3);
		expect(joinMap(shrunkMap)).toBe('2:c; 3:d; 4:e');

		expect(clampedMap.maximum).toBe(actualMax);

		setTimeout(() => {
			entriesMap.set(0, 'd');

			expect(entriesMap.full).toBe(false);
			expect(entriesMap.maximum).toBe(niceMax);
			expect(entriesMap.size).toBe(3);
			expect(joinMap(entriesMap)).toBe('1:b; 2:c; 0:d');

			maxMap.set(0, 'a');
			maxMap.set(1, 'b');
			maxMap.set(2, 'c');

			expect(maxMap.full).toBe(true);
			expect(maxMap.maximum).toBe(2);
			expect(maxMap.size).toBe(2);
			expect(joinMap(maxMap)).toBe('1:b; 2:c');

			shrunkMap.set(0, 'a');

			expect(shrunkMap.full).toBe(true);
			expect(shrunkMap.maximum).toBe(3);
			expect(shrunkMap.size).toBe(3);
			expect(joinMap(shrunkMap)).toBe('3:d; 4:e; 0:a');

			setTimeout(() => {
				entriesMap.get(1);

				expect(entriesMap.full).toBe(false);
				expect(entriesMap.maximum).toBe(niceMax);
				expect(entriesMap.size).toBe(3);
				expect(joinMap(entriesMap)).toBe('2:c; 0:d; 1:b');

				maxMap.get(1);

				expect(maxMap.full).toBe(true);
				expect(maxMap.maximum).toBe(2);
				expect(maxMap.size).toBe(2);
				expect(joinMap(maxMap)).toBe('2:c; 1:b');

				shrunkMap.get(3);

				expect(shrunkMap.full).toBe(true);
				expect(shrunkMap.maximum).toBe(3);
				expect(shrunkMap.size).toBe(3);
				expect(joinMap(shrunkMap)).toBe('4:e; 0:a; 3:d');

				done();
			});
		});
	}));

test('SizedSet', () =>
	new Promise<void>(done => {
		const valuesSet = new Sized.SizedSet(['a', 'b', 'c']);
		const maxSet = new Sized.SizedSet(2);
		const shrunkSet = new Sized.SizedSet(['a', 'b', 'c', 'd', 'e'], 3);
		const clampedSet = new Sized.SizedSet(actualMax + 1);

		expect(valuesSet.full).toBe(false);
		expect(valuesSet.maximum).toBe(niceMax);
		expect(valuesSet.size).toBe(3);
		expect(joinSet(valuesSet)).toBe('a; b; c');

		expect(maxSet.full).toBe(false);
		expect(maxSet.maximum).toBe(2);
		expect(maxSet.size).toBe(0);
		expect(joinSet(maxSet)).toBe('');

		expect(shrunkSet.full).toBe(true);
		expect(shrunkSet.maximum).toBe(3);
		expect(shrunkSet.size).toBe(3);
		expect(joinSet(shrunkSet)).toBe('c; d; e');

		expect(clampedSet.maximum).toBe(actualMax);

		setTimeout(() => {
			valuesSet.add('d');

			expect(valuesSet.full).toBe(false);
			expect(valuesSet.maximum).toBe(niceMax);
			expect(valuesSet.size).toBe(4);
			expect(joinSet(valuesSet)).toBe('a; b; c; d');

			maxSet.add('a');
			maxSet.add('b');
			maxSet.add('c');
			maxSet.add('c');

			expect(maxSet.full).toBe(true);
			expect(maxSet.maximum).toBe(2);
			expect(maxSet.size).toBe(2);
			expect(joinSet(maxSet)).toBe('b; c');

			shrunkSet.add('a');

			expect(shrunkSet.full).toBe(true);
			expect(shrunkSet.maximum).toBe(3);
			expect(shrunkSet.size).toBe(3);
			expect(joinSet(shrunkSet)).toBe('d; e; a');

			setTimeout(() => {
				expect(valuesSet.get('b'), 'b');
				expect(maxSet.get('c', true), 'c');
				expect(shrunkSet.at(1), 'a');
				expect(shrunkSet.at(0, true), 'd');

				expect(valuesSet.full).toBe(false);
				expect(valuesSet.maximum).toBe(niceMax);
				expect(valuesSet.size).toBe(4);
				expect(joinSet(valuesSet)).toBe('a; b; c; d');

				expect(maxSet.full).toBe(true);
				expect(maxSet.maximum).toBe(2);
				expect(maxSet.size).toBe(2);
				expect(joinSet(maxSet)).toBe('b; c');

				expect(shrunkSet.full).toBe(true);
				expect(shrunkSet.maximum).toBe(3);
				expect(shrunkSet.size).toBe(3);
				expect(joinSet(shrunkSet)).toBe('e; a; d');

				done();
			}, 125);
		});
	}));
