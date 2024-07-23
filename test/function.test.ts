import {expect, test} from 'bun:test';
import {debounce, memoise, noop, throttle} from '../src/js/function';
import {repeat, wait} from '../src/js/timer';

test('debounce', done => {
	let value = 0;

	const debounced = debounce(() => {
		value += 1;
	}, 50);

	for (let index = 0; index < 100; index += 1) {
		debounced();
	}

	wait(() => {
		expect(value).toBe(1);

		debounced();

		debounced.cancel();

		wait(() => {
			wait(() => {
				expect(value).toBe(1);

				done();
			});
		}, 25);
	}, 1000);
});

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
});

test('noop', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop.toString()).toMatch(/\s*function\s*noop\(\)\s*\{\s*\}\s*/);
	expect(noop()).toBeUndefined();
});

test('throttle', done => {
	let value = 0;

	const throttled = throttle(() => {
		value += 1;
	}, 250);

	const timer = repeat(
		() => {
			throttled();
		},
		{
			count: 10_000,
		},
	);

	wait(() => {
		timer.stop();

		expect(value).toBeLessThanOrEqual(10);

		done();
	}, 2500);
});
