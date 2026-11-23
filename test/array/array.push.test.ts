import {expect, test} from 'vite-plus/test';
import {append, push} from '../../src';

test('push', () => {
	expect(append).toBe(push);

	const length = 100_000;

	const values = Array.from({length}, (_, i) => i + 1);

	try {
		const failure: number[] = [];

		failure.push(...values);
	} catch (error) {
		expect(error).toBeInstanceOf(RangeError);
	}

	const array: number[] = [];

	expect(push(array, values)).toBe(length);

	expect(push('blah' as never, [])).toBe(0);
	expect(push([], 'blah' as never)).toBe(0);
	expect(push([], [])).toBe(0);
});
