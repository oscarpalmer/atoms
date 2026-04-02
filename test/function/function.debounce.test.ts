import {expect, test} from 'vitest';
import {debounce} from '../../src';

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

		const first = debounce.async(() => {
			result.first.count += 1;
		}, 25);

		for (let index = 0; index < 100; index += 1) {
			void first()
				.then(() => {
					result.first.succeeded += 1;
				})
				.catch(() => {
					result.first.failed += 1;
				});
		}

		const second = debounce.async(() => new Promise<void>(resolve => setTimeout(() => {
			result.second.count += 1;

			resolve();
		}, 50)), 25);

		for (let index = 0; index < 100; index += 1) {
			void second()
				.then(() => {
					result.second.succeeded += 1;
				})
				.catch(() => {
					result.second.failed += 1;
				});
		}

		const third = debounce.async(() => {
			result.third.count += 1;
		}, 25);

		third()
			.then(() => {
				result.third.succeeded += 1;
			})
			.catch(() => {
				result.third.failed += 1;
			});

		third.cancel();

		const fourth = debounce.async(() => {
			throw new Error('Error for debounce.async');
		}, 25);

		fourth()
			.then(() => {
				result.fourth.succeeded += 1;
			})
			.catch(error => {
				result.fourth.failed += 1;

				expect(error).toBeInstanceOf(Error);
				expect(error.message).toBe('Error for debounce.async');
			});

		setTimeout(() => {
			expect(result.first.count).toBe(1);
			expect(result.first.failed).toBe(100 - result.first.count);
			expect(result.first.succeeded).toBe(result.first.count);

			expect(result.second.count).toBe(1);
			expect(result.second.failed).toBe(100 - result.second.count);
			expect(result.second.succeeded).toBe(result.second.count);

			expect(result.third.count).toBe(0);
			expect(result.third.failed).toBe(1);
			expect(result.third.succeeded).toBe(result.third.count);

			expect(result.fourth.count).toBe(0);
			expect(result.fourth.failed).toBe(1);
			expect(result.fourth.succeeded).toBe(result.fourth.count);

			done();
		}, 250);
	}));

test('synchronous', () =>
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

			expect(defaulted.invalid).toBeLessThanOrEqual(20);
			expect(defaulted.zero).toBeLessThanOrEqual(20);

			expect(value).toBe(1);

			debounced();

			debounced.cancel();

			setTimeout(() => {
				expect(diff).toBeGreaterThanOrEqual(Math.floor(8 * 16));
				expect(diff).toBeLessThanOrEqual(Math.ceil(12 * 16));

				expect(value).toBe(1);

				done();
			}, 25);
		}, 1000);
	}));
