import {expect, test} from 'vitest';
import {tryPromise} from '../../src/promise';

test('asynchronous', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const results: number[] = [];

		void tryPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(0);
				}, 250);
			}),
		).then(result => {
			results.push(result);
		});

		void tryPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(1);
				}, 250);

				throw new Error('Thrown');
			}),
		).catch(error => {
			errors.push(error);
		});

		void tryPromise(
			() =>
				new Promise<number>(resolve => {
					setTimeout(() => {
						resolve(2);
					}, 250);
				}),
		).then(result => {
			results.push(result);
		});

		const firstController = new AbortController();
		const secondController = new AbortController();

		void tryPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(3);
				}, 250);
			}),
			firstController.signal,
		).catch(error => {
			errors.push(error);
		});

		firstController.abort('Aborted during');
		secondController.abort('Aborted before');

		void tryPromise(
			new Promise<number>(resolve => {
				setTimeout(() => {
					resolve(4);
				}, 250);
			}),
			secondController.signal,
		).catch(error => {
			errors.push(error);
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
		tryPromise(values[index] as never).catch(error => {
			expect(error).toBeInstanceOf(TypeError);
			expect((error as Error).message).toBe('TryPromise expected a function or a promise');
		});
	}
});

test('synchronous', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const results: unknown[] = [];

		tryPromise(() => 0).then(result => {
			results.push(result);
		});

		tryPromise(() => {
			throw new Error('Thrown');
		}).catch(error => {
			errors.push(error);
		});

		const firstController = new AbortController();
		const secondController = new AbortController();

		tryPromise(() => 2, firstController.signal).then(result => {
			results.push(result);
		});

		firstController.abort('Aborted during');
		secondController.abort('Aborted before');

		tryPromise(() => 3, secondController.signal).catch(error => {
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

		tryPromise(() => 0, 250).then(result => {
			results.push(result);
			times.push(performance.now() - start);
		});

		tryPromise(() => {
			throw new Error('Thrown');
		}, 250).catch(error => {
			errors.push(error);
			times.push(performance.now() - start);
		});

		void tryPromise(
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

		void tryPromise(
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
			expect(times[0]).toBeLessThan(10);
			expect(times[1]).toBeGreaterThanOrEqual(0);
			expect(times[1]).toBeLessThan(10);
			expect(times[2]).toBeGreaterThanOrEqual(240);
			expect(times[2]).toBeLessThan(260);
			expect(times[3]).toBeGreaterThanOrEqual(240);
			expect(times[3]).toBeLessThan(260);

			done();
		}, 500);
	}));
