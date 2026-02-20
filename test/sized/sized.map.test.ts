import {expect, test} from 'vitest';
import {SizedMap} from '../../src/sized';
import {sizedFixture} from '../.fixtures/sized.fixture';

const {actualMax, joinMap, niceMax} = sizedFixture;

test('', () =>
	new Promise<void>(done => {
		const entriesMap = new SizedMap([
			[0, 'a'],
			[1, 'b'],
			[2, 'c'],
		]);

		const maxMap = new SizedMap(2);

		const shrunkMap = new SizedMap(
			[
				[0, 'a'],
				[1, 'b'],
				[2, 'c'],
				[3, 'd'],
				[4, 'e'],
			],
			3,
		);

		const clampedMap = new SizedMap(actualMax + 1);

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
