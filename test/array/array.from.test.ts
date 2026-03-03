import {expect, test} from 'vitest';
import {range, times} from '../../src';

test('range', () => {
	expect(range(5)).toEqual([0, 1, 2, 3, 4]);
	expect(range(2, 5)).toEqual([2, 3, 4]);
	expect(range(2, 10, 2)).toEqual([2, 4, 6, 8]);
	expect(range(10, 2, -2)).toEqual([10, 8, 6, 4]);

	expect(range(-1)).toEqual([]);
	expect(range(0)).toEqual([]);
	expect(range('blah' as never)).toEqual([]);

	expect(range(2.5)).toEqual([0, 1, 2]);
	expect(range(5, 5)).toEqual([]);
	expect(range(1, 5, -1)).toEqual([]);

	expect(range(2, 5, 0)).toEqual([]);
	expect(range(2, 5, 'blah' as never)).toEqual([2, 3, 4]);
});

test('times', () => {
	expect(times(5)).toEqual([0, 1, 2, 3, 4]);
	expect(times(5, 'a')).toEqual(['a', 'a', 'a', 'a', 'a']);
	expect(times(5, index => index * 2)).toEqual([0, 2, 4, 6, 8]);

	expect(times(2.5)).toEqual([0, 1, 2]);
	expect(times(2, () => undefined)).toEqual([undefined, undefined]);

	expect(times(-1)).toEqual([]);
	expect(times(0)).toEqual([]);
	expect(times('blah' as never)).toEqual([]);
});
