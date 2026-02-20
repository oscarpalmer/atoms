import {expect, test} from 'vitest';
import {flatten} from '../../src/array';

test('', () => {
	expect(flatten([1, [2, [3, [4, [5, [6, [7, [8, [9, [10]]]]]]]]]])).toEqual([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	]);

	expect(flatten('blah' as never)).toEqual([]);
	expect(flatten([])).toEqual([]);
});
