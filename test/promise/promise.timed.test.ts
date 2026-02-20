import {expect, test} from 'vitest';
import {PromiseTimeoutError, timed} from '../../src/promise';

test('', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const values: unknown[] = [];

		void timed(new Promise(resolve => setTimeout(() => resolve(1), 500)), 1000)
			.then(value => {
				errors.push(undefined);
				values.push(value);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		void timed(new Promise(resolve => setTimeout(() => resolve(2), 500)), -123)
			.then(value => {
				errors.push(undefined);
				values.push(value);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		void timed(new Promise(resolve => setTimeout(() => resolve(3), 500)), 'blah' as never)
			.then(value => {
				errors.push(undefined);
				values.push(value);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		void timed(new Promise(resolve => setTimeout(() => resolve(5), 1000)), 500)
			.then(value => {
				errors.push(undefined);
				values.push(value);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		expect(() => timed('blah' as never, 123)).toThrowError('Timed function expected a Promise');

		setTimeout(() => {
			expect(errors.length).toBe(4);
			expect(values.length).toBe(4);

			expect(errors[0]).toBeUndefined();
			expect(errors[1]).toBeUndefined();
			expect(errors[2]).toBeUndefined();

			expect(errors[3]).toBeInstanceOf(PromiseTimeoutError);
			expect((errors[3] as PromiseTimeoutError).message).toBe('Promise timed out');

			expect(values[0]).toBe(1);
			expect(values[1]).toBe(2);
			expect(values[2]).toBe(3);
			expect(values[3]).toBeUndefined();

			done();
		}, 1000);
	}));

test('abort', () =>
	new Promise<void>(done => {
		const first = new AbortController();
		const second = new AbortController();

		const start = Date.now();

		const errors: unknown[] = [undefined, undefined, undefined];
		const times: unknown[] = [undefined, undefined, undefined];

		void timed(new Promise(resolve => setTimeout(resolve, 200)), {
			signal: first.signal,
			time: 300,
		})
			.then(() => {
				times[0] = Date.now() - start;
			})
			.catch(error => {
				errors[0] = error;
			});

		second.abort('Already aborted!');

		void timed(new Promise(resolve => setTimeout(resolve, 200)), {
			signal: second.signal,
			time: 300,
		})
			.then(() => {
				times[1] = Date.now() - start;
			})
			.catch(error => {
				errors[1] = error;
			});

		void timed(new Promise(resolve => setTimeout(resolve, 200)), {
			signal: 'blah' as never,
			time: 300,
		})
			.then(() => {
				times[2] = Date.now() - start;
			})
			.catch(error => {
				errors[2] = error;
			});

		setTimeout(() => {
			first.abort('Aborted during!');
		}, 100);

		setTimeout(() => {
			expect(errors.length).toBe(3);
			expect(times.length).toBe(3);

			expect(errors[0]).toBe('Aborted during!');
			expect(errors[1]).toBe('Already aborted!');
			expect(errors[2]).toBeUndefined();

			expect(times[0]).toBeUndefined();
			expect(times[1]).toBeUndefined();
			expect(times[2]).toBeGreaterThanOrEqual(190);
			expect(times[2]).toBeLessThanOrEqual(210);

			done();
		}, 500);
	}));
