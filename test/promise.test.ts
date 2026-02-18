import {expect, test} from 'vitest';
import {delay, promises, PromiseTimeoutError, timed} from '../src/promise';

test('delay', () =>
	new Promise<void>(done => {
		const start = Date.now();

		delay(1000).then(() => {
			expect(Date.now() - start).toBeGreaterThanOrEqual(1000);
			done();
		});
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
