import {expect, test} from 'vitest';
import {SizedSet} from '../../src';
import {sizedFixture} from '../.fixtures/sized.fixture';

const {actualMax, joinSet, niceMax} = sizedFixture;

test('', () =>
	new Promise<void>(done => {
		const valuesSet = new SizedSet(['a', 'b', 'c']);
		const maxSet = new SizedSet(2);
		const shrunkSet = new SizedSet(['a', 'b', 'c', 'd', 'e'], 3);
		const clampedSet = new SizedSet(actualMax + 1);

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
				expect(shrunkSet.get('a'), 'a');
				expect(shrunkSet.get('d', true), 'd');
				expect(shrunkSet.get('x'), undefined);

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
