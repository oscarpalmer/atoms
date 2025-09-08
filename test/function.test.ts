import {expect, test} from 'vitest';
import {debounce, memoize, noop, throttle} from '../src/function';
import {milliseconds} from '../src/internal/function';

test('debounce', () =>
	new Promise<void>(done => {
		let diff = 0;
		let value = 0;

		const debounced = debounce(() => {
			value += 1;
		}, 50);

		const start = performance.now();

		debounce(() => {
			diff = performance.now() - start;
		}, 160)();

		for (let index = 0; index < 100; index += 1) {
			debounced();
		}

		setTimeout(() => {
			expect(value).toBe(1);

			debounced();

			debounced.cancel();

			setTimeout(() => {
				setTimeout(() => {
					expect(diff).toBeGreaterThanOrEqual(9 * milliseconds);
					expect(diff).toBeLessThanOrEqual(11 * milliseconds);
					expect(value).toBe(1);

					done();
				});
			}, 25);
		}, 1000);
	}));

test('memoize', () => {
	const memoized = memoize((value: number) => value * 2);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBeUndefined();

	expect(memoized.run(2)).toBe(4);
	expect(memoized.run(3)).toBe(6);

	expect(memoized.has(2)).toBe(true);
	expect(memoized.has(3)).toBe(true);
	expect(memoized.get(2)).toBe(4);
	expect(memoized.get(3)).toBe(6);

	expect(memoized.run(2)).toBe(4);
	expect(memoized.run(3)).toBe(6);

	memoized.delete(2);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(true);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBe(6);

	memoized.clear();

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBeUndefined();

	memoized.destroy();

	expect(memoized.has(2)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();

	/* try {
		memoized.run(2);
	} catch (error) {
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe('The Memoized instance has been destroyed');
	} */
});

test('noop', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});

test('throttle', () =>
	new Promise<void>(done => {
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
		}, 16);

		const cancelleable = throttle(() => {
			cancelValue = 999;
		}, 500);

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

			expect(value).toBeGreaterThan(count / 2 - 2);
			expect(value).toBeLessThan(count / 2 + 2);
			expect(cancelValue).toBe(0);
			expect(last).toBe(1);

			done();
		}, 500);
	}));
