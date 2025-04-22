import {expect, test} from 'vitest';
import {debounce, memoize, noop, throttle} from '../src/function';

test('debounce', () =>
	new Promise<void>(done => {
		let value = 0;

		const debounced = debounce(() => {
			value += 1;
		}, 50);

		for (let index = 0; index < 100; index += 1) {
			debounced();
		}

		setTimeout(() => {
			expect(value).toBe(1);

			debounced();

			debounced.cancel();

			setTimeout(() => {
				setTimeout(() => {
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
});

test('noop', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});

test('throttle', () =>
	new Promise<void>(done => {
		let cancelValue = 0;
		let last = 0;
		let value = 0;

		const throttled = throttle(() => {
			value += 1;
		}, 25);

		const interval = setInterval(() => {
			throttled();
		}, 12.5);

		setTimeout(() => {
			clearInterval(interval);

			expect(value).toBeLessThanOrEqual(100);
			expect(cancelValue).toBe(0);
			expect(last).toBe(1);

			done();
		}, 500);

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
	}));
