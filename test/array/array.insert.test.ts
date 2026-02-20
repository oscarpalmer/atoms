import {expect, test} from 'vitest';
import {insert} from '../../src/array';

test('', () => {
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
