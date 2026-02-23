import {expect, test} from 'vitest';
import {error, isError, isOk, isResult, ok, result, unwrap} from '../../src';

test('error', () => {
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

test('ok', () => {
	const item = ok('success');

	expect(isOk(item)).toBe(true);
	expect(isError(item)).toBe(false);

	expect(item.ok).toBe(true);
	expect(item.value).toBe('success');
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
