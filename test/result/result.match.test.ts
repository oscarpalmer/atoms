import {expect, test} from 'vitest';
import {attempt, error, ok, Result} from '../../src';

test('match: asynchronous', async () => {
	const handler = {
		error(e: unknown) {
			return e;
		},
		ok(value: unknown) {
			return value;
		},
	};

	let errorResponse = await attempt.match.async(
		attempt(() => {
			throw 'failure 1';
		}),
		handler,
	);

	let okResponse = await attempt.match.async(
		attempt(() => 'success 1'),
		handler,
	);

	expect(errorResponse).toBe('failure 1');
	expect(okResponse).toBe('success 1');

	const errorResult = error('failure 2');
	const okResult = ok('success 2');

	errorResponse = await attempt.match.async(errorResult, handler);
	okResponse = await attempt.match.async(okResult, handler);

	expect(errorResponse).toBe('failure 2');
	expect(okResponse).toBe('success 2');

	errorResponse += (await attempt.match.async(errorResult, handler.ok, handler.error)) as string;
	okResponse += (await attempt.match.async(okResult, handler.ok, handler.error)) as string;

	expect(errorResponse).toBe('failure 2failure 2');
	expect(okResponse).toBe('success 2success 2');

	const promisedResponse = await attempt.match.async(
		new Promise<Result<string, string>>(resolve => resolve(ok('success 3'))),
		value => value,
		() => 'failure 3',
	);

	expect(promisedResponse).toBe('success 3');

	await expect(attempt.match.async('blah' as never, handler)).rejects.toThrow(Error);
	await expect(attempt.match.async(() => 'blah' as never, handler)).rejects.toThrow(Error);

	await expect(
		attempt.match.async(errorResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).rejects.toThrow(Error);

	await expect(
		attempt.match.async(okResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).rejects.toThrow(Error);

	await expect(attempt.match.async(errorResult, 'blah' as never, 'blah' as never)).rejects.toThrow(
		Error,
	);

	await expect(attempt.match.async(okResult, 'blah' as never, 'blah' as never)).rejects.toThrow(
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

	let errorResponse = attempt.match(
		attempt(() => {
			throw 'failure 1';
		}),
		handler,
	);

	let okResponse = attempt.match(
		attempt(() => 'success 1'),
		handler,
	);

	expect(errorResponse).toBe('failure 1');
	expect(okResponse).toBe('success 1');

	const errorResult = error('failure 2');
	const okResult = ok('success 2');

	errorResponse = attempt.match(errorResult, handler);
	okResponse = attempt.match(okResult, handler);

	expect(errorResponse).toBe('failure 2');
	expect(okResponse).toBe('success 2');

	errorResponse += attempt.match(errorResult, handler.ok, handler.error) as string;
	okResponse += attempt.match(okResult, handler.ok, handler.error) as string;

	expect(errorResponse).toBe('failure 2failure 2');
	expect(okResponse).toBe('success 2success 2');

	expect(() => attempt.match('blah' as never, handler)).toThrow(Error);
	expect(() => attempt.match(() => 'blah' as never, handler)).toThrow(Error);

	expect(() =>
		attempt.match(errorResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).toThrow(Error);

	expect(() =>
		attempt.match(okResult, {
			error: 'blah' as never,
			ok: 'blah' as never,
		}),
	).toThrow(Error);

	expect(() => attempt.match(errorResult, 'blah' as never, 'blah' as never)).toThrow(Error);
	expect(() => attempt.match(okResult, 'blah' as never, 'blah' as never)).toThrow(Error);
});
