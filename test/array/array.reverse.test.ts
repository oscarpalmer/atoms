import {expect, test} from 'vitest';
import {reverse} from '../../src';

test('', () => {
	const arrays = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]];

	const results = [[], [1], [2, 1], [3, 2, 1], [4, 3, 2, 1], [5, 4, 3, 2, 1]];

	const {length} = arrays;

	for (let index = 0; index < length; index += 1) {
		expect(reverse(arrays[index])).toEqual(results[index]);
	}

	expect(reverse('blah' as never)).toEqual([]);
});
