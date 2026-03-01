import {expect, test} from 'vitest';
import {range} from '../../src';

test('', () => {
	expect(range(5)).toEqual([0, 1, 2, 3, 4]);
	expect(range(5, 'a')).toEqual(['a', 'a', 'a', 'a', 'a']);
	expect(range(5, index => index * 2)).toEqual([0, 2, 4, 6, 8]);

	expect(range(-1)).toEqual([]);
	expect(range(0)).toEqual([]);
	expect(range('blah' as never)).toEqual([]);
});
