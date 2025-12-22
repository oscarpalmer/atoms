import {expect, test} from 'vitest';
import {debounce, memoize, noop, throttle} from '../src/function';
import FRAME_RATE_MS from '../src/internal/frame-rate';

test('debounce', () =>
	new Promise<void>(done => {
		const defaulted = {
			invalid: undefined,
			zero: undefined,
		};

		const start = performance.now();

		let diff = 0;
		let value = 0;

		const debounced = debounce(() => {
			value += 1;
		}, 50);

		debounce(() => {
			diff = performance.now() - start;
		}, 160)();

		for (let index = 0; index < 100; index += 1) {
			debounced();
		}

		const defaultedInvalid = debounce(() => {
			defaulted.invalid = (performance.now() - start) as never;
		}, 'blah' as never);

		const defaultedZero = debounce(() => {
			defaulted.zero = (performance.now() - start) as never;
		}, 0);

		defaultedInvalid();
		defaultedZero();

		setTimeout(() => {
			expect(defaulted.invalid).toBeGreaterThan(0);
			expect(defaulted.zero).toBeGreaterThan(0);

			expect(defaulted.invalid).toBeLessThanOrEqual(Math.ceil(FRAME_RATE_MS));
			expect(defaulted.zero).toBeLessThanOrEqual(Math.ceil(FRAME_RATE_MS));

			expect(value).toBe(1);

			debounced();

			debounced.cancel();

			setTimeout(() => {
				expect(diff).toBeGreaterThanOrEqual(Math.floor(8.5 * FRAME_RATE_MS));
				expect(diff).toBeLessThanOrEqual(Math.ceil(11.5 * FRAME_RATE_MS));
				expect(value).toBe(1);

				done();
			}, 25);
		}, 1000);
	}));

test('memoize', () => {
	const memoized = memoize((value: number) => value * 2);

	expect(memoized.maximum).toBe(2 ** 16);
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

	// Defaults

	expect(memoize(noop).maximum).toBe(2 ** 16);
	expect(memoize(noop, 128).maximum).toBe(128);
	expect(memoize(noop, 0).maximum).toBe(2 ** 16);
	expect(memoize(noop, -1).maximum).toBe(2 ** 16);
	expect(memoize(noop, 'blah' as never).maximum).toBe(2 ** 16);
	expect(memoize(noop, {} as never).maximum).toBe(2 ** 16);

	try {
		memoized.run(2);
	} catch (error) {
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe('The Memoized instance has been destroyed');
	}
});

test('noop', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});

test('throttle', () =>
	new Promise<void>(done => {
		const defaults = {
			invalid: 0,
			zero: 0,
		};

		let cancelValue = 0;
		let count = 0;
		let last = 0;
		let value = 0;

		const throttled = throttle(() => {
			value += 1;
		}, 32);

		const interval = setInterval(() => {
			count += 1;

			throttled();

			defaultsInvalid();
			defaultsZero();
		}, 16);

		const cancelleable = throttle(() => {
			cancelValue = 999;
		}, 500);

		const defaultsInvalid = throttle(() => {
			defaults.invalid += 1;
		}, 'blah' as never);

		const defaultsZero = throttle(() => {
			defaults.zero += 1;
		}, 0);

		cancelleable();

		setTimeout(() => {
			cancelleable.cancel();

			const lastThrottled = throttle(() => {
				last += 1;
			}, 25);

			lastThrottled();
			lastThrottled();
			lastThrottled();
		}, 250);

		setTimeout(() => {
			clearInterval(interval);

			expect(value).toBeGreaterThanOrEqual(Math.floor(count / 2 - 2));
			expect(value).toBeLessThanOrEqual(Math.floor(count / 2 + 2));

			expect(defaults.invalid).toBeGreaterThanOrEqual(count - 2);
			expect(defaults.invalid).toBeLessThanOrEqual(count + 2);
			expect(defaults.zero).toBeGreaterThanOrEqual(count - 2);
			expect(defaults.zero).toBeLessThanOrEqual(count + 2);

			expect(cancelValue).toBe(0);
			expect(last).toBe(1);

			done();
		}, 500);
	}));
