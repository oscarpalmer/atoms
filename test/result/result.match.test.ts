import {expect, test} from 'vitest';
import {attempt, error, matchResult, ok, Result} from '../../src';

test('match: asynchronous', async () => {
	const handler = {
		error(e: unknown) {
			return e;
		},
		ok(value: unknown) {
			return value;
		},
	};

	let errorResponse = await matchResult.async(
		attempt(() => {
			throw 'failure 1';
		}),
		handler,
	);

	let okResponse = await matchResult.async(
		attempt(() => 'success 1'),
		handler,
	);

	expect(errorResponse).toBe('failure 1');
	expect(okResponse).toBe('success 1');

	const errorResult = error('failure 2');
	const okResult = ok('success 2');

	errorResponse = await matchResult.async(errorResult, handler);
	okResponse = await matchResult.async(okResult, handler);

	expect(errorResponse).toBe('failure 2');
	expect(okResponse).toBe('success 2');

	errorResponse += (await matchResult.async(errorResult, handler.ok, handler.error)) as string;
	okResponse += (await matchResult.async(okResult, handler.ok, handler.error)) as string;

	expect(errorResponse).toBe('failure 2failure 2');
	expect(okResponse).toBe('success 2success 2');

	const promisedResponse = await matchResult.async(
		new Promise<Result<string, string>>(resolve => resolve(ok('success 3'))),
		value => value,
		() => 'failure 3',
	);

	expect(promisedResponse).toBe('success 3');

	await expect(matchResult.async('blah' as never, handler)).rejects.toThrow(Error);
	await expect(matchResult.async(() => 'blah' as never, handler)).rejects.toThrow(Error);

	await expect(
		matchResult.async(errorResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).rejects.toThrow(Error);

	await expect(
		matchResult.async(okResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).rejects.toThrow(Error);

	await expect(matchResult.async(errorResult, 'blah' as never, 'blah' as never)).rejects.toThrow(
		Error,
	);

	await expect(matchResult.async(okResult, 'blah' as never, 'blah' as never)).rejects.toThrow(
		Error,
	);
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

	let errorResponse = matchResult(
		attempt(() => {
			throw 'failure 1';
		}),
		handler,
	);

	let okResponse = matchResult(
		attempt(() => 'success 1'),
		handler,
	);

	expect(errorResponse).toBe('failure 1');
	expect(okResponse).toBe('success 1');

	const errorResult = error('failure 2');
	const okResult = ok('success 2');

	errorResponse = matchResult(errorResult, handler);
	okResponse = matchResult(okResult, handler);

	expect(errorResponse).toBe('failure 2');
	expect(okResponse).toBe('success 2');

	errorResponse += matchResult(errorResult, handler.ok, handler.error) as string;
	okResponse += matchResult(okResult, handler.ok, handler.error) as string;

	expect(errorResponse).toBe('failure 2failure 2');
	expect(okResponse).toBe('success 2success 2');

	expect(() => matchResult('blah' as never, handler)).toThrow(Error);
	expect(() => matchResult(() => 'blah' as never, handler)).toThrow(Error);

	expect(() =>
		matchResult(errorResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).toThrow(Error);

	expect(() =>
		matchResult(okResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).toThrow(Error);

	expect(() => matchResult(errorResult, 'blah' as never, 'blah' as never)).toThrow(Error);
	expect(() => matchResult(okResult, 'blah' as never, 'blah' as never)).toThrow(Error);
});
