import {expect, test} from 'vitest';
import {chunk} from '../../src/array';

test('', () => {
	const array = Array.from({length: 10_000}, (_, i) => i + 1);

	expect(chunk(array).length).toBe(2);
	expect(chunk(array, 4_000).length).toBe(3);
	expect(chunk(array, 10_000).length).toBe(2);

	expect(chunk('blah' as never)).toEqual([]);
	expect(chunk([])).toEqual([]);
});
