import {expect, test} from 'vitest';
import {attempt, attemptPromise} from '../../src';

test('asynchronous', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const results: number[] = [];

		void attemptPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(0);
				}, 250);
			}),
		).then(result => {
			results[0] = result;
		});

		void attemptPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(1);
				}, 250);

				throw new Error('Thrown');
			}),
		).catch(error => {
			errors[0] = error;
		});

		void attemptPromise(
			() =>
				new Promise<number>(resolve => {
					setTimeout(() => {
						resolve(2);
					}, 250);
				}),
		).then(result => {
			results[1] = result;
		});

		const firstController = new AbortController();
		const secondController = new AbortController();

		void attemptPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(3);
				}, 250);
			}),
			firstController.signal,
		).catch(error => {
			errors[1] = error;
		});

		firstController.abort('Aborted during');
		secondController.abort('Aborted before');

		void attemptPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(4);
				}, 250);
			}),
			secondController.signal,
		).catch(error => {
			errors[2] = error;
		});

		setTimeout(() => {
			expect(errors.length).toBe(3);

			expect((errors[0] as Error).message).toBe('Thrown');
			expect(errors[1]).toBe('Aborted during');
			expect(errors[2]).toBe('Aborted before');

			expect(results).toEqual([0, 2]);

			done();
		}, 500);
	}));

test('error', () => {
	const values = [
		undefined,
		null,
		0,
		1,
		'',
		'string',
		Symbol('symbol'),
		{},
		[],
		new Map(),
		new Set(),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		void attemptPromise(values[index] as never).catch(error => {
			expect(error).toBeInstanceOf(TypeError);
			expect((error as Error).message).toBe('Attempt expected a function or a promise');
		});
	}
});

test('synchronous', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const results: unknown[] = [];

		void attemptPromise(() => 0).then(result => {
			results.push(result);
		});

		void attemptPromise(() => {
			throw new Error('Thrown');
		}).catch(error => {
			errors.push(error);
		});

		const firstController = new AbortController();
		const secondController = new AbortController();

		void attemptPromise(() => 2, firstController.signal).then(result => {
			results.push(result);
		});

		firstController.abort('Aborted during');
		secondController.abort('Aborted before');

		void attemptPromise(() => 3, secondController.signal).catch(error => {
			errors.push(error);
		});

		setTimeout(() => {
			expect(errors.length).toBe(2);

			expect((errors[0] as Error).message).toBe('Thrown');
			expect(errors[1]).toBe('Aborted before');

			expect(results).toEqual([0, 2]);

			done();
		}, 100);
	}));

test('timed', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const results: number[] = [];
		const times: number[] = [];

		const start = performance.now();

		attemptPromise(() => 0, 250).then(result => {
			results.push(result);
			times.push(performance.now() - start);
		});

		attemptPromise(() => {
			throw new Error('Thrown');
		}, 250).catch(error => {
			errors.push(error);
			times.push(performance.now() - start);
		});

		void attemptPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(1);
				}, 250);
			}),
			500,
		).then(result => {
			results.push(result);
			times.push(performance.now() - start);
		});

		void attemptPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(2);
				}, 500);
			}),
			250,
		).catch(error => {
			errors.push(error);
			times.push(performance.now() - start);
		});

		setTimeout(() => {
			expect(errors.length).toBe(2);

			expect((errors[0] as Error).message).toBe('Thrown');
			expect((errors[1] as Error).message).toBe('Promise timed out');

			expect(results).toEqual([0, 1]);

			expect(times[0]).toBeGreaterThanOrEqual(0);
			expect(times[0]).toBeLessThan(50);
			expect(times[1]).toBeGreaterThanOrEqual(0);
			expect(times[1]).toBeLessThan(50);
			expect(times[2]).toBeGreaterThanOrEqual(200);
			expect(times[2]).toBeLessThan(300);
			expect(times[3]).toBeGreaterThanOrEqual(200);
			expect(times[3]).toBeLessThan(300);

			done();
		}, 500);
	}));
