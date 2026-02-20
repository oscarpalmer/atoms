import {expect, test} from 'vitest';
import {debounce} from '../../src/function';
import FRAME_RATE_MS from '../../src/internal/frame-rate';

test('', () =>
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

			expect(defaulted.invalid).toBeLessThanOrEqual(FRAME_RATE_MS + 1);
			expect(defaulted.zero).toBeLessThanOrEqual(FRAME_RATE_MS + 1);

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
