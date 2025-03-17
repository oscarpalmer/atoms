import {expect, test} from 'vitest';
import {debounce, memoise, noop, throttle} from '../src/function';

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

test('memoise', () => {
	const memoised = memoise((value: number) => value * 2);

	expect(memoised.has(2)).toBe(false);
	expect(memoised.has(3)).toBe(false);
	expect(memoised.get(2)).toBeUndefined();
	expect(memoised.get(3)).toBeUndefined();

	expect(memoised.run(2)).toBe(4);
	expect(memoised.run(3)).toBe(6);

	expect(memoised.has(2)).toBe(true);
	expect(memoised.has(3)).toBe(true);
	expect(memoised.get(2)).toBe(4);
	expect(memoised.get(3)).toBe(6);

	expect(memoised.run(2)).toBe(4);
	expect(memoised.run(3)).toBe(6);

	memoised.delete(2);

	expect(memoised.has(2)).toBe(false);
	expect(memoised.has(3)).toBe(true);
	expect(memoised.get(2)).toBeUndefined();
	expect(memoised.get(3)).toBe(6);

	memoised.clear();

	expect(memoised.has(2)).toBe(false);
	expect(memoised.has(3)).toBe(false);
	expect(memoised.get(2)).toBeUndefined();
	expect(memoised.get(3)).toBeUndefined();

	memoised.destroy();

	try {
		expect(memoised.run(2)).toBeUndefined();
	} catch (error) {
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe('The memoised instance has been destroyed');
	}

	expect(memoised.has(2)).toBe(false);
	expect(memoised.get(2)).toBeUndefined();
});

test('noop', () => {
	expect(noop).toBeInstanceOf(Function);
	// expect(noop.toString()).toMatch(/\s*function\s*noop\(\)\s*\{\s*\}\s*/);
	expect(noop()).toBeUndefined();
});

test('throttle', () =>
	new Promise<void>(done => {
		let value = 0;

		const throttled = throttle(() => {
			value += 1;
		}, 250);

		const interval = setInterval(() => {
			throttled();
		});

		setTimeout(() => {
			clearInterval(interval);

			expect(value).toBeLessThanOrEqual(10);
			expect(cancelValue).toBe(0);

			done();
		}, 2500);

		let cancelValue = 0;

		const cancelleable = throttle(() => {
			cancelValue = 999;
		}, 500);

		cancelleable();

		setTimeout(() => {
			cancelleable.cancel();
		}, 250);
	}));
