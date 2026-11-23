import {expect, test} from 'vite-plus/test';
import {Err, isFulfilled, isRejected, Ok, ok, promises, toResult} from '../../src';
import {PROMISE_MESSAGE_RESULT} from '../../src/models/promise.model';

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

test('toResult', async () => {
	const fulfilled = await toResult(() => Promise.resolve('Success!'));
	const rejected = await toResult(() => Promise.reject(new Error('Failure!')));

	expect(fulfilled.ok).toBe(true);
	expect((fulfilled as Ok<string>).value).toBe('Success!');

	expect(rejected.ok).toBe(false);
	expect((rejected as Err<never, Error>).error).toBeInstanceOf(Error);
	expect((rejected as Err<never, Error>).error.message).toBe('Failure!');

	const thrown = await toResult(() => {
		throw new Error('Thrown!');
	});

	expect(thrown.ok).toBe(false);
	expect((thrown as Err<never, Error>).error).toBeInstanceOf(Error);
	expect((thrown as Err<never, Error>).error.message).toBe('Thrown!');

	await expect(toResult('blah' as never)).rejects.toThrow(PROMISE_MESSAGE_RESULT);
	await expect(toResult(() => 'blah' as never)).rejects.toThrow(PROMISE_MESSAGE_RESULT);
});

test('toResult: thenables', async () => {
	const thenable = {
		then(resolve: (value: unknown) => void): never {
			resolve(1);

			return undefined as never;
		},
	};

	const result = toResult(thenable as never);

	expect(result).toBeInstanceOf(Promise);
	expect(await result).toEqual(ok(1));
});
