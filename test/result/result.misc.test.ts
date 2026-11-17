import {expect, test} from 'vite-plus/test';
import {
	attempt,
	error,
	isError,
	isOk,
	isResult,
	ok,
	RESULT_MESSAGE_PROMISE,
	toPromise,
	unwrap,
} from '../../src';

test('is', () => {
	const values = [
		null,
		undefined,
		false,
		true,
		123456789,
		'Hello, world!',
		new Date(),
		[],
		{},
		() => {},
		new Map(),
		new Set(),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		expect(isError(value)).toBe(false);
		expect(isOk(value)).toBe(false);
		expect(isResult(value)).toBe(false);
	}
});

test('toPromise', async () => {
	const success = ok('Hello, world!');
	const failure = error('Something went wrong!');

	await expect(toPromise(success)).resolves.toBe('Hello, world!');
	await expect(toPromise(failure)).rejects.toBe('Something went wrong!');

	await expect(toPromise(() => success)).resolves.toBe('Hello, world!');
	await expect(toPromise(() => failure)).rejects.toBe('Something went wrong!');

	await expect(toPromise('blah' as never)).rejects.toThrow(RESULT_MESSAGE_PROMISE);

	await expect(toPromise(() => 'blah' as never)).rejects.toThrow(RESULT_MESSAGE_PROMISE);
});

test('unwrap', () => {
	const failure = attempt(() => {
		throw new Error('Failure');
	});

	const success = attempt(() => 'Hello, world!');

	expect(unwrap(success, () => 'Oh no…')).toBe('Hello, world!');
	expect(unwrap(failure, error => `${error.message}!`)).toBe('Failure!');

	expect(
		unwrap(123 as never, error => {
			expect(error).toBeUndefined();

			return 'Oh no…';
		}),
	).toBe('Oh no…');

	expect(unwrap(success, 'Oh no…')).toBe('Hello, world!');
	expect(unwrap(failure, 'Oh no…')).toBe('Oh no…');
	expect(unwrap(123 as never, 'Oh no…')).toBe('Oh no…');

	expect(unwrap(success)).toBe('Hello, world!');
	expect(() => unwrap(failure)).toThrow();
	expect(() => unwrap(123 as never)).toThrow();
});
