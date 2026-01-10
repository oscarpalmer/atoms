import {expect, test} from 'vitest';
import {error, isError, isOk, isResult, ok, result, unwrap} from '../src/result';

test('error + isError', () => {
	const basic = error('basic');
	const extended = error('extended', new Error('original'));

	expect(isError(basic)).toBe(true);
	expect(isError(basic, true)).toBe(false);

	expect(isError(extended)).toBe(true);
	expect(isError(extended, true)).toBe(true);

	expect(isOk(basic)).toBe(false);
	expect(isOk(extended)).toBe(false);

	expect(basic.error).toBe('basic');
	expect(extended.error).toBe('extended');

	expect(basic.ok).toBe(false);
	expect(extended.ok).toBe(false);

	expect((basic as any).original).toBeUndefined();
	expect(extended.original).toBeInstanceOf(Error);
	expect(extended.original.message).toBe('original');

	expect((basic as any).value).toBeUndefined();
	expect((extended as any).value).toBeUndefined();
});

test('isError, isOk, isResult', () => {
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

test('ok + isOk', () => {
	const item = ok('success');

	expect(isOk(item)).toBe(true);
	expect(isError(item)).toBe(false);

	expect(item.ok).toBe(true);
	expect(item.value).toBe('success');
});

test('result + isResult', () => {
	const failure = result(() => {
		throw new Error('failure');
	});

	const failureCustom = result(() => {
		throw new Error('failure');
	}, new Error('custom failure'));

	const success = result(() => 'success');

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

	const invalid = result(123 as never);

	expect(isResult(invalid)).toBe(true);
	expect(isOk(invalid)).toBe(false);
	expect(isError(invalid)).toBe(true);
	expect((invalid as any).error).toBeInstanceOf(TypeError);
	expect((invalid as any).error.message).toBe('callback is not a function');
});

test('result.async', async () => {
	const rejected = await result.async(
		async () =>
			new Promise<void>((_, reject) =>
				setTimeout(() => {
					reject(new Error('failure'));
				}, 50),
			),
	);

	const rejectedCustom = await result.async(
		async () =>
			new Promise<void>((_, reject) =>
				setTimeout(() => {
					reject(new Error('failure'));
				}, 50),
			),
		new Error('custom failure'),
	);

	const resolved = await result.async(
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

test('unwrap', () => {
	const failure = result(() => {
		throw new Error();
	});

	const success = result(() => 'Hello, world!');

	expect(unwrap(success, 'Oh no…')).toBe('Hello, world!');
	expect(unwrap(failure, 'Oh no…')).toBe('Oh no…');
	expect(unwrap(123 as never, 'Oh no…')).toBe('Oh no…');
});
