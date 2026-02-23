import {expect, test} from 'vitest';
import {promises} from '../../src';

test('abort', () =>
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

test('eager', () =>
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

test('validation', () =>
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

test('relaxed', () =>
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
