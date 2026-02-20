import {expect, test} from 'vitest';
import {delay, isFulfilled, isRejected, promises, PromiseTimeoutError, timed} from '../src/promise';

test('delay', () =>
	new Promise<void>(done => {
		const start = Date.now();

		const errors: unknown[] = [undefined, undefined, undefined];
		const values: number[][] = [undefined, undefined, undefined] as unknown as number[][];

		void delay(500)
			.then(() => {
				values[0] = [Date.now() - start, 490, 510];
			})
			.catch(error => {
				errors[0] = error;
			});

		void delay(-999)
			.then(() => {
				values[1] = [Date.now() - start, 0, 10];
			})
			.catch(error => {
				errors[1] = error;
			});

		void delay('blah' as never)
			.then(() => {
				values[2] = [Date.now() - start, 0, 10];
			})
			.catch(error => {
				errors[2] = error;
			});

		setTimeout(() => {
			expect(errors.length).toBe(3);
			expect(values.length).toBe(3);

			expect(errors).toEqual([undefined, undefined, undefined]);

			for (const value of values) {
				expect(value[0]).toBeGreaterThanOrEqual(value[1]);
				expect(value[0]).toBeLessThanOrEqual(value[2]);
			}

			done();
		}, 1000);
	}));

test('delay: abort', () =>
	new Promise<void>(done => {
		const start = Date.now();

		const errors: unknown[] = [undefined, undefined, undefined, undefined];

		const values: number[][] = [
			undefined,
			undefined,
			undefined,
			undefined,
		] as unknown as number[][];

		void delay({
			signal: AbortSignal.timeout(250),
			time: 500,
		})
			.then(() => {
				values[0] = [Date.now() - start, 240, 260];
			})
			.catch(error => {
				errors[0] = error;
			});

		const first = new AbortController();
		const second = new AbortController();

		void delay({
			signal: first.signal,
			time: 500,
		})
			.then(() => {
				values[1] = [Date.now() - start, 240, 260];
			})
			.catch(error => {
				errors[1] = error;
			});

		second.abort('Already aborted!');

		void delay({
			signal: second.signal,
			time: 500,
		})
			.then(() => {
				values[2] = [Date.now() - start, 240, 260];
			})
			.catch(error => {
				errors[2] = error;
			});

		void delay({
			signal: 'blah' as never,
			time: 500,
		})
			.then(() => {
				values[3] = [Date.now() - start, 490, 510];
			})
			.catch(error => {
				errors[3] = error;
			});

		setTimeout(() => {
			first.abort('Aborted during!');
		}, 250);

		setTimeout(() => {
			expect(errors.length).toBe(4);
			expect(values.length).toBe(4);

			expect(errors[0]).toBeInstanceOf(Error);
			expect((errors[0] as Error).name).toBe('TimeoutError');

			expect(errors[1]).toBe('Aborted during!');
			expect(errors[2]).toBe('Already aborted!');
			expect(errors[3]).toBeUndefined();

			expect(values[0]).toBeUndefined();
			expect(values[1]).toBeUndefined();
			expect(values[2]).toBeUndefined();

			expect(values[3][0]).toBeGreaterThanOrEqual(values[3][1]);
			expect(values[3][0]).toBeLessThanOrEqual(values[3][2]);

			done();
		}, 1000);
	}));

test('is', () =>
	new Promise<void>(done => {
		const values = [undefined, null, 1, 'string', {}, [], new Map(), new Set(), () => {}];
		const {length} = values;

		for (let index = 0; index < length; index += 1) {
			const value = values[index];

			expect(isFulfilled(value)).toBe(false);
			expect(isRejected(value)).toBe(false);
		}

		values.splice(0);

		const errors: unknown[] = [];

		void promises([Promise.resolve(1), Promise.reject(new Error('Nope!'))])
			.then(value => {
				values.push(...value);
			})
			.catch(() => {
				errors.push('Error!');
			});

		setTimeout(() => {
			expect(errors.length).toBe(0);
			expect(values.length).toBe(2);

			expect(isFulfilled(values[0])).toBe(true);
			expect(isRejected(values[0])).toBe(false);

			expect(isFulfilled(values[1])).toBe(false);
			expect(isRejected(values[1])).toBe(true);

			done();
		}, 500);
	}));

test('promises: abort', () =>
	new Promise<void>(done => {
		const first = new AbortController();
		const second = new AbortController();
		const third = new AbortController();
		const fourth = new AbortController();

		const errors = {
			first: undefined,
			second: undefined,
			third: undefined,
			fourth: undefined,
		} as Record<string, string | undefined>;

		const values = {
			first: undefined,
			second: undefined,
			third: undefined,
			fourth: undefined,
		} as Record<string, unknown>;

		void promises(
			[
				new Promise<number>(resolve => setTimeout(() => resolve(1), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(2), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(3), 200)),
			],
			{
				eager: true,
				signal: first.signal,
			},
		)
			.then(value => {
				values.first = value;
			})
			.catch(error => {
				errors.first = error;
			});

		second.abort('Already aborted second!');

		void promises(
			[
				new Promise<number>(resolve => setTimeout(() => resolve(1), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(2), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(3), 200)),
			],
			{
				signal: second.signal,
			},
		)
			.then(value => {
				values.second = value;
			})
			.catch(error => {
				errors.second = error;
			});

		void promises(
			[
				new Promise<number>(resolve => setTimeout(() => resolve(1), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(2), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(3), 200)),
			],
			third.signal,
		)
			.then(value => {
				values.third = value;
			})
			.catch(error => {
				errors.third = error;
			});

		setTimeout(() => {
			first.abort('Aborted first during!');
			third.abort('Aborted third during!');
		}, 100);

		fourth.abort('Aborted fourth during!');

		void promises(
			[
				new Promise<number>(resolve => setTimeout(() => resolve(1), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(2), 200)),
				new Promise<number>(resolve => setTimeout(() => resolve(3), 200)),
			],
			fourth.signal,
		)
			.then(value => {
				values.fourth = value;
			})
			.catch(error => {
				errors.fourth = error;
			});

		setTimeout(() => {
			expect(errors.first).toBe('Aborted first during!');
			expect(errors.second).toBe('Already aborted second!');
			expect(errors.third).toBe('Aborted third during!');
			expect(errors.fourth).toBe('Aborted fourth during!');

			expect(values.first).toBeUndefined();
			expect(values.second).toBeUndefined();
			expect(values.third).toBeUndefined();
			expect(values.fourth).toBeUndefined();

			done();
		}, 300);
	}));

test('promises: eager', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const values: unknown[] = [];

		void promises(
			[new Promise<number>(resolve => resolve(1)), new Promise<string>(resolve => resolve('2'))],
			true,
		)
			.then(results => {
				errors.push(undefined);
				values.push(results);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		void promises(
			[
				new Promise<number>(resolve => resolve(1)),
				new Promise<string>(resolve => resolve('2')),
				new Promise<boolean>((_, reject) => reject(new Error('Nope!'))),
			],
			true,
		)
			.then(results => {
				errors.push(undefined);
				values.push(results);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		setTimeout(() => {
			expect(errors.length).toBe(2);
			expect(values.length).toBe(2);

			expect(errors[0]).toBeUndefined();
			expect(errors[1]).toBeInstanceOf(Error);
			expect((errors[1] as Error).message).toBe('Nope!');

			expect(values[0]).toEqual([1, '2']);
			expect(values[1]).toBeUndefined();

			done();
		}, 500);
	}));

test('promises: validation', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const values: unknown[] = [];

		void promises([1, '2', true] as never)
			.then(results => {
				errors.push(undefined);
				values.push(results);
			})
			.catch(error => {
				errors.push(error);
				values.push(undefined);
			});

		setTimeout(() => {
			expect(errors.length).toBe(1);
			expect(values.length).toBe(1);

			expect(errors[0]).toBeUndefined();
			expect(values[0]).toEqual([]);

			done();
		}, 500);
	}));

test('promises: relaxed', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [undefined, undefined];
		const values: unknown[] = [undefined, undefined];

		void promises([
			new Promise<number>(resolve => resolve(1)),
			new Promise<string>(resolve => resolve('2')),
			new Promise<boolean>((_, reject) => reject(new Error('Nope!'))),
		])
			.then(results => {
				values[0] = results;
			})
			.catch(error => {
				errors[0] = error;
			});

		void promises([
			new Promise<number>(resolve => resolve(1)),
			new Promise<string>(resolve => resolve('2')),
			new Promise<boolean>((_, reject) => reject(new Error('Nope!'))),
			new Promise<bigint[]>(resolve => resolve([1n, 2n])),
		])
			.then(results => {
				values[1] = results;
			})
			.catch(error => {
				errors[1] = error;
			});

		setTimeout(() => {
			expect(errors.length).toBe(2);
			expect(values.length).toBe(2);

			expect(errors[0]).toBeUndefined();
			expect(errors[1]).toBeUndefined();

			expect(values[0]).toEqual([
				{status: 'fulfilled', value: 1},
				{status: 'fulfilled', value: '2'},
				{status: 'rejected', reason: new Error('Nope!')},
			]);

			expect(values[1]).toEqual([
				{status: 'fulfilled', value: 1},
				{status: 'fulfilled', value: '2'},
				{status: 'rejected', reason: new Error('Nope!')},
				{status: 'fulfilled', value: [1n, 2n]},
			]);

			done();
		}, 500);
	}));

test('timed', () =>
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

test('timed: abort', () =>
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
