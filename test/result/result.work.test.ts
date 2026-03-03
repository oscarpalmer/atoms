import {expect, test} from 'vitest';
import {attempt, Err, error, isError, isOk, ok, Ok} from '../../src';

test('flow: asynchronous', async () => {
	const nameTransformer = attempt.flow.async(
		async (name: string) => name.trim(),
		async name => name.split(' '),
		async parts => parts.map(part => part[0].toUpperCase() + part.slice(1)),
		async parts => parts.join(' '),
	);

	const transformedName = await nameTransformer('  oscar de la renta  ');

	expect(isOk(transformedName)).toBe(true);
	expect((transformedName as Ok<string>).value).toBe('Oscar De La Renta');

	const invalidName = await nameTransformer(123 as never);

	expect(isError(invalidName)).toBe(true);
	expect((invalidName as Err<Error>).error).toBeInstanceOf(Error);

	const invalidFlow = await attempt.flow.async(() => {}, 'not a function' as never)();

	expect(isError(invalidFlow)).toBe(true);
	expect((invalidFlow as Err<Error>).error.message).toBe(
		'Flow expected to receive an array of functions',
	);

	const handleResult = attempt.flow.async(
		(_: unknown) => {},
		() => 'Test value!',
	);

	const errorResult = await handleResult(error('Test error!'));
	const okResult = await handleResult(ok('Should pass'));

	expect(isError(errorResult)).toBe(true);
	expect(isOk(okResult)).toBe(true);

	expect((errorResult as Err<unknown>).error).toBe('Test error!');
	expect((okResult as Ok<string>).value).toBe('Test value!');
});

test('flow: synchronous', () => {
	const nameTransformer = attempt.flow(
		(name: string) => name.trim(),
		name => name.split(' '),
		parts => parts.map(part => part[0].toUpperCase() + part.slice(1)),
		parts => parts.join(' '),
	);

	const transformedName = nameTransformer('  oscar de la renta  ');

	expect(isOk(transformedName)).toBe(true);
	expect((transformedName as Ok<string>).value).toBe('Oscar De La Renta');

	const invalidName = nameTransformer(123 as never);

	expect(isError(invalidName)).toBe(true);
	expect((invalidName as Err<Error>).error).toBeInstanceOf(Error);

	const invalidFlow = attempt.flow(() => {}, 'not a function' as never)();

	expect(isError(invalidFlow)).toBe(true);
	expect((invalidFlow as Err<Error>).error.message).toBe(
		'Flow expected to receive an array of functions',
	);

	const handleResult = attempt.flow(
		(_: unknown) => {},
		() => 'Test value!',
	);

	const errorResult = handleResult(error('Test error!'));
	const okResult = handleResult(ok('Should pass'));

	expect(isError(errorResult)).toBe(true);
	expect(isOk(okResult)).toBe(true);

	expect((errorResult as Err<unknown>).error).toBe('Test error!');
	expect((okResult as Ok<string>).value).toBe('Test value!');
});

test('pipe: asynchronous', async () => {
	const fn = await attempt.pipe.async(
		() => 123,
		x => x + 1,
		x => x * 2,
	);

	const same = await attempt.pipe.async(
		123,
		x => x + 1,
		x => x * 2,
	);

	const diff = await attempt.pipe.async(
		123,
		x => x + 1,
		x => String(x),
		x => `${x} is a number`,
	);

	const resultOk = await attempt.pipe.async(
		attempt(() => 123),
		x => x + 1,
		x => x * 2,
	);

	const resultErr = await attempt.pipe.async(
		attempt(() => {
			throw new Error('Test error');
		}),
	);

	const simple = await attempt.pipe.async(123);

	expect(isOk(fn)).toBe(true);
	expect((fn as Ok<number>).value).toBe(248);

	expect(isOk(same)).toBe(true);
	expect((same as Ok<number>).value).toBe(248);

	expect(isOk(diff)).toBe(true);
	expect((diff as Ok<string>).value).toBe('124 is a number');

	expect(isOk(resultOk)).toBe(true);
	expect((resultOk as Ok<number>).value).toBe(248);

	expect(isError(resultErr)).toBe(true);
	expect((resultErr as Err<Error>).error.message).toBe('Test error');

	expect(isOk(simple)).toBe(true);
	expect((simple as Ok<number>).value).toBe(123);

	//

	const invalid = await attempt.pipe.async(123, (x: number) => x + 1, 'not a function' as never);

	expect(isError(invalid)).toBe(true);

	expect((invalid as Err<Error>).error.message).toBe(
		'Pipe expected to receive an array of functions',
	);

	const failed = await attempt.pipe.async(123 as never, (value: string) => value.trim());

	expect(isError(failed)).toBe(true);
});

test('pipe: synchronous', () => {
	const fn = attempt.pipe(
		() => 123,
		x => x + 1,
		x => x * 2,
	);

	const same = attempt.pipe(
		123,
		x => x + 1,
		x => x * 2,
	);

	const diff = attempt.pipe(
		123,
		x => x + 1,
		x => String(x),
		x => `${x} is a number`,
	);

	const resultOk = attempt.pipe(
		attempt(() => 123),
		x => x + 1,
		x => x * 2,
	);

	const resultErr = attempt.pipe(
		attempt(() => {
			throw new Error('Test error');
		}),
	);

	const simple = attempt.pipe(123);

	expect(isOk(fn)).toBe(true);
	expect((fn as Ok<number>).value).toBe(248);

	expect(isOk(same)).toBe(true);
	expect((same as Ok<number>).value).toBe(248);

	expect(isOk(diff)).toBe(true);
	expect((diff as Ok<string>).value).toBe('124 is a number');

	expect(isOk(resultOk)).toBe(true);
	expect((resultOk as Ok<number>).value).toBe(248);

	expect(isError(resultErr)).toBe(true);
	expect((resultErr as Err<Error>).error.message).toBe('Test error');

	expect(isOk(simple)).toBe(true);
	expect((simple as Ok<number>).value).toBe(123);

	//

	const invalid = attempt.pipe(123, (x: number) => x + 1, 'not a function' as never);

	expect(isError(invalid)).toBe(true);

	expect((invalid as Err<Error>).error.message).toBe(
		'Pipe expected to receive an array of functions',
	);

	const failed = attempt.pipe(123 as never, (value: string) => value.trim());

	expect(isError(failed)).toBe(true);
});

test('return types', () => {
	const basicFlow = attempt.flow(
		() => 'Initial value!',
		() => attempt(() => 'Returned value!'),
	)();

	const basicPipe = attempt.pipe(
		() => {},
		() => attempt(() => 'Test value!'),
	);

	expect(isOk(basicFlow)).toBe(true);
	expect(isOk(basicPipe)).toBe(true);

	expect((basicFlow as Ok<string>).value).toBe('Returned value!');
	expect((basicPipe as Ok<string>).value).toBe('Test value!');

	const errorFlow = attempt.flow(
		() => {},
		() =>
			attempt(() => {
				throw new Error('Test error!');
			}),
	)();

	const errorPipe = attempt.pipe(
		() => {},
		() =>
			attempt(() => {
				throw new Error('Test error!');
			}),
	);

	expect(isError(errorFlow)).toBe(true);
	expect(isError(errorPipe)).toBe(true);

	expect((errorFlow as Err<Error>).error.message).toBe('Test error!');
	expect((errorPipe as Err<Error>).error.message).toBe('Test error!');

	const promiseFailFlow = attempt.flow(
		() => {},
		() => new Promise(() => {}),
	)();

	const promiseFailPipe = attempt.pipe(
		() => {},
		() => new Promise(() => {}),
	);

	expect(isError(promiseFailFlow)).toBe(true);
	expect(isError(promiseFailPipe)).toBe(true);

	expect((promiseFailFlow as Err<Error>).error.message).toBe(
		'Synchronous Flow received a promise. Use `flow.async` instead.',
	);

	expect((promiseFailPipe as Err<Error>).error.message).toBe(
		'Synchronous Pipe received a promise. Use `pipe.async` instead.',
	);

	const nestingFailFlow = attempt.flow(
		() => {},
		() => () => () => {},
	)();

	const nestingFailPipe = attempt.pipe(
		() => {},
		() => () => () => {},
	);

	expect(isError(nestingFailFlow)).toBe(true);
	expect(isError(nestingFailPipe)).toBe(true);

	expect((nestingFailFlow as Err<Error>).error.message).toBe(
		'Return values are too deeply nested.',
	);

	expect((nestingFailPipe as Err<Error>).error.message).toBe(
		'Return values are too deeply nested.',
	);
});
