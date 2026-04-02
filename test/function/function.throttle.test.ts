import {expect, test} from 'vitest';
import {throttle} from '../../src';

test('asynchronous', () =>
	new Promise<void>(done => {
		const result = {
			first: {
				count: 0,
				failed: 0,
				succeeded: 0,
			},
			second: {
				count: 0,
				failed: 0,
				succeeded: 0,
			},
			third: {
				count: 0,
				failed: 0,
				succeeded: 0,
			},
			fourth: {
				count: 0,
				failed: 0,
				succeeded: 0,
			},
		};

		const size = 100_000;

		const first = throttle.async(() => {
			result.first.count += 1;
		}, 25);

		for (let index = 0; index < size; index += 1) {
			void first()
				.then(() => {
					result.first.succeeded += 1;
				})
				.catch(() => {
					result.first.failed += 1;
				});
		}

		const second = throttle.async(
			() =>
				new Promise<void>(resolve => {
					result.second.count += 1;

					resolve();
				}),
			25,
		);

		for (let index = 0; index < size; index += 1) {
			void second()
				.then(() => {
					result.second.succeeded += 1;
				})
				.catch(() => {
					result.second.failed += 1;
				});
		}

		const third = throttle.async(() => {
			result.third.count += 1;
		}, 25);

		void third()
			.then(() => {
				result.third.succeeded += 1;
			})
			.catch(() => {
				result.third.failed += 1;
			});

		third.cancel();

		const fourth = throttle.async(() => {
			throw new Error('Error for throttle.async');
		}, 25);

		void fourth()
			.then(() => {
				result.fourth.succeeded += 1;
			})
			.catch(error => {
				result.fourth.failed += 1;

				expect(error).toBeInstanceOf(Error);
				expect(error.message).toBe('Error for throttle.async');
			});

		setTimeout(() => {
			expect(result.first.count).toBeGreaterThan(1);
			expect(result.first.failed).toBe(size - result.first.count);
			expect(result.first.succeeded).toBe(result.first.count);

			expect(result.second.count).toBeGreaterThan(1);
			expect(result.second.failed).toBe(size - result.second.count);
			expect(result.second.succeeded).toBe(result.second.count);

			expect(result.third.count).toBe(0);
			expect(result.third.failed).toBe(1);
			expect(result.third.succeeded).toBe(result.third.count);

			expect(result.fourth.count).toBe(0);
			expect(result.fourth.failed).toBe(1);
			expect(result.fourth.succeeded).toBe(result.fourth.count);

			done();
		}, 1000);
	}));

test('synchronous', () =>
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
