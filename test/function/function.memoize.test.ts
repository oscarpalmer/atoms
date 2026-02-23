import {expect, test} from 'vitest';
import {memoize, noop} from '../../src';

test('', () => {
	const memoized = memoize((value: number) => value * 2);

	expect(memoized.maximum).toBe(1024);
	expect(memoized.size).toBe(0);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBeUndefined();

	expect(memoized.run(2)).toBe(4);
	expect(memoized.run(3)).toBe(6);
	expect(memoized.size).toBe(2);

	expect(memoized.has(2)).toBe(true);
	expect(memoized.has(3)).toBe(true);
	expect(memoized.get(2)).toBe(4);
	expect(memoized.get(3)).toBe(6);

	expect(memoized.run(2)).toBe(4);
	expect(memoized.run(3)).toBe(6);

	expect(memoized.delete(2)).toBe(true);

	expect(memoized.size).toBe(1);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(true);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBe(6);

	memoized.clear();

	expect(memoized.size).toBe(0);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBeUndefined();

	memoized.destroy();

	expect(memoized.maximum).toBeNaN();
	expect(memoized.size).toBeNaN();
	expect(memoized.has(2)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.delete(2)).toBe(false);

	const keyed = memoize((_: string, value: number) => value * 3);

	expect(keyed.run('a', 2)).toBe(6);
	expect(keyed.run('b', 2)).toBe(6);
	expect(keyed.run('a', 3)).toBe(9);
	expect(keyed.run('b', 3)).toBe(9);

	expect(keyed.size).toBe(4);

	expect(keyed.has('a_2')).toBe(true);
	expect(keyed.has('b_2')).toBe(true);
	expect(keyed.has('a_3')).toBe(true);
	expect(keyed.has('b_3')).toBe(true);

	expect(keyed.get('a_2')).toBe(6);
	expect(keyed.get('b_2')).toBe(6);
	expect(keyed.get('a_3')).toBe(9);
	expect(keyed.get('b_3')).toBe(9);

	keyed.delete('a_2');
	keyed.delete('b_2');
	keyed.delete('a_3');
	keyed.delete('b_3');

	expect(keyed.size).toBe(0);

	expect(keyed.has('a_2')).toBe(false);
	expect(keyed.has('b_2')).toBe(false);
	expect(keyed.has('a_3')).toBe(false);
	expect(keyed.has('b_3')).toBe(false);

	expect(keyed.get('a_2')).toBeUndefined();
	expect(keyed.get('b_2')).toBeUndefined();
	expect(keyed.get('a_3')).toBeUndefined();
	expect(keyed.get('b_3')).toBeUndefined();

	const callbacked = memoize(value => value ** 2, {
		cacheKey: value => value % 2 === 0,
	});

	expect(callbacked.run(2)).toBe(4);
	expect(callbacked.run(4)).toBe(4);
	expect(callbacked.run(3)).toBe(9);
	expect(callbacked.run(5)).toBe(9);

	expect(callbacked.size).toBe(2);

	expect(callbacked.has(true)).toBe(true);
	expect(callbacked.has(false)).toBe(true);

	expect(callbacked.get(true)).toBe(4);
	expect(callbacked.get(false)).toBe(9);

	callbacked.delete(true);
	callbacked.delete(false);

	expect(callbacked.size).toBe(0);

	expect(callbacked.has(true)).toBe(false);
	expect(callbacked.has(false)).toBe(false);

	expect(callbacked.get(true)).toBeUndefined();
	expect(callbacked.get(false)).toBeUndefined();

	// Defaults

	expect(memoize(noop).maximum).toBe(1024);
	expect(memoize(noop, {cacheSize: 128}).maximum).toBe(128);
	expect(memoize(noop, 0 as never).maximum).toBe(1024);
	expect(memoize(noop, {cacheSize: -1}).maximum).toBe(1024);
	expect(memoize(noop, {cacheSize: 'blah' as never}).maximum).toBe(1024);
	expect(memoize(noop, {}).maximum).toBe(1024);

	try {
		memoized.run(2);
	} catch (error) {
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe('The Memoized instance has been destroyed');
	}
});
