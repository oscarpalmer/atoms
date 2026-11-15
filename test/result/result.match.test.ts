import {expect, test} from 'vite-plus/test';
import {attempt, error, match, ok, Result} from '../../src';

test('match: asynchronous', async () => {
	const handler = {
		error(e: unknown) {
			return e;
		},
		ok(value: unknown) {
			return value;
		},
	};

	let errorResponse = await match(
		attempt(() => {
			throw 'failure 1';
		}),
		handler,
	);

	let okResponse = await match(
		attempt(() => 'success 1'),
		handler,
	);

	expect(errorResponse).toBe('failure 1');
	expect(okResponse).toBe('success 1');

	const errorResult = error('failure 2');
	const okResult = ok('success 2');

	errorResponse = await match(errorResult, handler);
	okResponse = await match(okResult, handler);

	expect(errorResponse).toBe('failure 2');
	expect(okResponse).toBe('success 2');

	errorResponse += (await match(errorResult, handler.ok, handler.error)) as string;
	okResponse += (await match(okResult, handler.ok, handler.error)) as string;

	expect(errorResponse).toBe('failure 2failure 2');
	expect(okResponse).toBe('success 2success 2');

	const promisedResponse = await match(
		new Promise<Result<string, string>>(resolve => resolve(ok('success 3'))),
		value => value,
		() => 'failure 3',
	);

	expect(promisedResponse).toBe('success 3');

	const callbackResponse = await match(
		() => new Promise<Result<string, string>>(resolve => resolve(error('failure 4'))),
		() => 'success 4',
		value => value,
	);

	expect(callbackResponse).toBe('failure 4');

	const asyncResponse = await match(
		new Promise<Result<string, string>>(resolve => resolve(ok('success 5'))),
		async value => `${value}!`,
		async () => 'failure 5',
	);

	expect(asyncResponse).toBe('success 5!');

	await expect(match(Promise.resolve('blah') as never, handler)).rejects.toThrow(Error);
	await expect(match(() => Promise.resolve('blah') as never, handler)).rejects.toThrow(Error);

	await expect(match(Promise.reject(new Error('rejected')) as never, handler)).rejects.toThrow(
		'rejected',
	);

	await expect(
		match(Promise.resolve(okResult), {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).rejects.toThrow(TypeError);
});

test('match: synchronous', () => {
	const handler = {
		error(e: unknown) {
			return e;
		},
		ok(value: unknown) {
			return value;
		},
	};

	const firstErrorResponse = match(
		attempt(() => {
			throw 'failure 1';
		}),
		handler,
	);

	const firstOkResponse = match(
		attempt(() => 'success 1'),
		handler,
	);

	expect(firstErrorResponse).toBe('failure 1');
	expect(firstOkResponse).toBe('success 1');

	const errorResult = error('failure 2');
	const okResult = ok('success 2');

	const secondErrorResponse = match(errorResult, handler);
	const secondOkResponse = match(okResult, handler);

	expect(secondErrorResponse).toBe('failure 2');
	expect(secondOkResponse).toBe('success 2');

	const thirdErrorResponse = match(errorResult, handler.ok, handler.error) as string;
	const thirdOkResponse = match(okResult, handler.ok, handler.error) as string;

	expect(secondErrorResponse + thirdErrorResponse).toBe('failure 2failure 2');
	expect(secondOkResponse + thirdOkResponse).toBe('success 2success 2');

	expect(() => match('blah' as never, handler)).toThrow(Error);
	expect(() => match(() => 'blah' as never, handler)).toThrow(Error);

	expect(() =>
		match(errorResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).toThrow(Error);

	expect(() =>
		match(okResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).toThrow(Error);

	expect(() => match(errorResult, 'blah' as never, 'blah' as never)).toThrow(Error);
	expect(() => match(okResult, 'blah' as never, 'blah' as never)).toThrow(Error);
});
