import {expect, test} from 'vitest';
import {attempt, isError, isOk, isResult} from '../../src';

test('synchronous', () => {
	const failure = attempt(() => {
		throw new Error('failure');
	});

	const failureCustom = attempt(() => {
		throw new Error('failure');
	}, new Error('custom failure'));

	const success = attempt(() => 'success');

	expect(isResult(failure)).toBe(true);
	expect(isResult(failureCustom)).toBe(true);
	expect(isResult(success)).toBe(true);

	expect(isError(failure)).toBe(true);
	expect(isError(failureCustom)).toBe(true);
	expect(isError(success)).toBe(false);

	expect(isError(failure, true)).toBe(false);
	expect(isError(failureCustom, true)).toBe(true);
	expect(isError(success, true)).toBe(false);

	expect(isOk(failure)).toBe(false);
	expect(isOk(failureCustom)).toBe(false);
	expect(isOk(success)).toBe(true);

	expect((failure as any).error).toBeInstanceOf(Error);
	expect((failure as any).error.message).toBe('failure');
	expect((failure as any).original).toBeUndefined();

	expect((failureCustom as any).error).toBeInstanceOf(Error);
	expect((failureCustom as any).error.message).toBe('custom failure');
	expect((failureCustom as any).original).toBeInstanceOf(Error);
	expect((failureCustom as any).original.message).toBe('failure');

	expect((failureCustom as any).value).toBeUndefined();
	expect((failure as any).value).toBeUndefined();
	expect((success as any).value).toBe('success');

	const invalid = attempt(123 as never);

	expect(isResult(invalid)).toBe(true);
	expect(isOk(invalid)).toBe(false);
	expect(isError(invalid)).toBe(true);
	expect((invalid as any).error).toBeInstanceOf(TypeError);
	expect((invalid as any).error.message).toBe('callback is not a function');
});

test('asynchronous', async () => {
	const rejected = await attempt.async(
		async () =>
			new Promise<void>((_, reject) =>
				setTimeout(() => {
					reject(new Error('failure'));
				}, 50),
			),
	);

	const rejectedCustom = await attempt.async(
		new Promise<void>((_, reject) =>
			setTimeout(() => {
				reject(new Error('failure'));
			}, 50),
		),
		new Error('custom failure'),
	);

	const resolved = await attempt.async(
		async () =>
			new Promise<string>(resolve =>
				setTimeout(() => {
					resolve('success');
				}, 50),
			),
	);

	expect(isError(rejected)).toBe(true);
	expect(isError(rejected, true)).toBe(false);
	expect(isOk(rejected)).toBe(false);

	expect(isError(rejectedCustom)).toBe(true);
	expect(isError(rejectedCustom, true)).toBe(true);
	expect(isOk(rejectedCustom)).toBe(false);

	expect(isError(resolved)).toBe(false);
	expect(isError(resolved, true)).toBe(false);
	expect(isOk(resolved)).toBe(true);

	expect((rejected as any).error).toBeInstanceOf(Error);
	expect((rejected as any).error.message).toBe('failure');
	expect((rejected as any).original).toBeUndefined();
	expect((rejected as any).value).toBeUndefined();

	expect((rejectedCustom as any).error).toBeInstanceOf(Error);
	expect((rejectedCustom as any).error.message).toBe('custom failure');
	expect((rejectedCustom as any).original).toBeInstanceOf(Error);
	expect((rejectedCustom as any).original.message).toBe('failure');
	expect((rejectedCustom as any).value).toBeUndefined();

	expect((resolved as any).error).toBeUndefined();
	expect((resolved as any).original).toBeUndefined();
	expect((resolved as any).value).toBe('success');
});
