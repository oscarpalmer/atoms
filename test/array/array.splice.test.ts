import {expect, test} from 'vitest';
import {splice} from '../../src';

test('', () => {
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
