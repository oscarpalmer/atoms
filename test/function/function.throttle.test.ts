import {expect, test} from 'vitest';
import {throttle} from '../../src/function';

test('', () =>
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
