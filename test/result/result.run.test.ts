import {expect, test} from 'vite-plus/test';
import {attempt, isError, isOk, isResult} from '../../src';

test('synchronous', () => {
	const failure = attempt(() => {
		throw new Error('failure');
	});

	const success = attempt(() => 'success');

	expect(isResult(failure)).toBe(true);
	expect(isResult(success)).toBe(true);

	expect(isError(failure)).toBe(true);
	expect(isError(success)).toBe(false);

	expect(isOk(failure)).toBe(false);
	expect(isOk(success)).toBe(true);

	expect((failure as any).error).toBeInstanceOf(Error);
	expect((failure as any).error.message).toBe('failure');
	expect((failure as any).original).toBeUndefined();

	expect((failure as any).value).toBeUndefined();
	expect((success as any).value).toBe('success');

	expect(() => attempt(123 as never)).toThrow();
});

test('asynchronous', async () => {
	const rejected = await attempt(
		async () =>
			new Promise<void>((_, reject) =>
				setTimeout(() => {
					reject(new Error('failure'));
				}, 50),
			),
	);

	const resolved = await attempt(
		async () =>
			new Promise<string>(resolve =>
				setTimeout(() => {
					resolve('success: basic');
				}, 50),
			),
	);

	const resolvedPromise = await attempt(
		new Promise<string>(resolve => {
			setTimeout(() => {
				resolve('success: promise');
			}, 50);
		}),
	);

	expect(isError(rejected)).toBe(true);
	expect(isOk(rejected)).toBe(false);

	expect(isError(resolved)).toBe(false);
	expect(isOk(resolved)).toBe(true);

	expect(isError(resolvedPromise)).toBe(false);
	expect(isOk(resolvedPromise)).toBe(true);

	expect((rejected as any).error).toBeInstanceOf(Error);
	expect((rejected as any).error.message).toBe('failure');
	expect((rejected as any).original).toBeUndefined();
	expect((rejected as any).value).toBeUndefined();

	expect((resolved as any).error).toBeUndefined();
	expect((resolved as any).original).toBeUndefined();
	expect((resolved as any).value).toBe('success: basic');

	expect((resolvedPromise as any).error).toBeUndefined();
	expect((resolvedPromise as any).original).toBeUndefined();
	expect((resolvedPromise as any).value).toBe('success: promise');
});
