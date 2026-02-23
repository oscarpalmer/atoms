import {expect, test} from 'vitest';
import {compact} from '../../src';

test('', () => {
	expect(compact([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, ''])).toEqual([0, 1, 2, 3, false, 4, '']);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, ''], true)).toEqual([1, 2, 3, 4]);

	expect(compact('blah' as never)).toEqual([]);
});
