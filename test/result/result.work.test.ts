import {expect, test} from 'vite-plus/test';
import {attempt, attemptFlow, attemptPipe, Err, error, isError, isOk, ok, Ok} from '../../src';
import {
	WORK_MESSAGE_FLOW_ARRAY,
	WORK_MESSAGE_FLOW_PROMISE,
	WORK_MESSAGE_PIPE_ARRAY,
	WORK_MESSAGE_PIPE_PROMISE,
} from '../../src/models/function/work.model';

test('flow: asynchronous', async () => {
	const nameTransformer = attemptFlow.async(
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
	expect((invalidName as Err<never, Error>).error).toBeInstanceOf(Error);

	const invalidFlow = await attemptFlow.async(() => {}, 'not a function' as never)();

	expect(isError(invalidFlow)).toBe(true);
	expect((invalidFlow as Err<never, Error>).error.message).toBe(WORK_MESSAGE_FLOW_ARRAY);

	const handleResult = attemptFlow.async(
		(_: unknown) => {},
		() => 'Test value!',
	);

	const errorResult = await handleResult(error('Test error!'));
	const okResult = await handleResult(ok('Should pass'));

	expect(isError(errorResult)).toBe(true);
	expect(isOk(okResult)).toBe(true);

	expect((errorResult as Err<unknown, unknown>).error).toBe('Test error!');
	expect((okResult as Ok<string>).value).toBe('Test value!');
});

test('flow: synchronous', () => {
	const nameTransformer = attemptFlow(
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
	expect((invalidName as Err<never, Error>).error).toBeInstanceOf(Error);

	const invalidFlow = attemptFlow(() => {}, 'not a function' as never)();

	expect(isError(invalidFlow)).toBe(true);
	expect((invalidFlow as Err<never, Error>).error.message).toBe(WORK_MESSAGE_FLOW_ARRAY);

	const handleResult = attemptFlow(
		(_: unknown) => {},
		() => 'Test value!',
	);

	const errorResult = handleResult(error('Test error!'));
	const okResult = handleResult(ok('Should pass'));

	expect(isError(errorResult)).toBe(true);
	expect(isOk(okResult)).toBe(true);

	expect((errorResult as Err<unknown, unknown>).error).toBe('Test error!');
	expect((okResult as Ok<string>).value).toBe('Test value!');
});

test('pipe: asynchronous', async () => {
	const fn = await attemptPipe.async(
		() => 123,
		x => x + 1,
		x => x * 2,
	);

	const same = await attemptPipe.async(
		123,
		x => x + 1,
		x => x * 2,
	);

	const diff = await attemptPipe.async(
		123,
		x => x + 1,
		x => String(x),
		x => `${x} is a number`,
	);

	const resultOk = await attemptPipe.async(
		attempt(() => 123),
		x => x + 1,
		x => x * 2,
	);

	const resultErr = await attemptPipe.async(
		attempt(() => {
			throw new Error('Test error');
		}),
	);

	const simple = await attemptPipe.async(123);

	expect(isOk(fn)).toBe(true);
	expect((fn as Ok<number>).value).toBe(248);

	expect(isOk(same)).toBe(true);
	expect((same as Ok<number>).value).toBe(248);

	expect(isOk(diff)).toBe(true);
	expect((diff as Ok<string>).value).toBe('124 is a number');

	expect(isOk(resultOk)).toBe(true);
	expect((resultOk as Ok<number>).value).toBe(248);

	expect(isError(resultErr)).toBe(true);
	expect((resultErr as Err<never, Error>).error.message).toBe('Test error');

	expect(isOk(simple)).toBe(true);
	expect((simple as Ok<number>).value).toBe(123);

	//

	const invalid = await attemptPipe.async(123, (x: number) => x + 1, 'not a function' as never);

	expect(isError(invalid)).toBe(true);

	expect((invalid as Err<never, Error>).error.message).toBe(WORK_MESSAGE_PIPE_ARRAY);

	const failed = await attemptPipe.async(123 as never, (value: string) => value.trim());

	expect(isError(failed)).toBe(true);
});

test('pipe: synchronous', () => {
	const fn = attemptPipe(
		() => 123,
		x => x + 1,
		x => x * 2,
	);

	const same = attemptPipe(
		123,
		x => x + 1,
		x => x * 2,
	);

	const diff = attemptPipe(
		123,
		x => x + 1,
		x => String(x),
		x => `${x} is a number`,
	);

	const resultOk = attemptPipe(
		attempt(() => 123),
		x => x + 1,
		x => x * 2,
	);

	const resultErr = attemptPipe(
		attempt(() => {
			throw new Error('Test error');
		}),
	);

	const simple = attemptPipe(123);

	expect(isOk(fn)).toBe(true);
	expect((fn as Ok<number>).value).toBe(248);

	expect(isOk(same)).toBe(true);
	expect((same as Ok<number>).value).toBe(248);

	expect(isOk(diff)).toBe(true);
	expect((diff as Ok<string>).value).toBe('124 is a number');

	expect(isOk(resultOk)).toBe(true);
	expect((resultOk as Ok<number>).value).toBe(248);

	expect(isError(resultErr)).toBe(true);
	expect((resultErr as Err<never, Error>).error.message).toBe('Test error');

	expect(isOk(simple)).toBe(true);
	expect((simple as Ok<number>).value).toBe(123);

	//

	const invalid = attemptPipe(123, (x: number) => x + 1, 'not a function' as never);

	expect(isError(invalid)).toBe(true);

	expect((invalid as Err<never, Error>).error.message).toBe(WORK_MESSAGE_PIPE_ARRAY);

	const failed = attemptPipe(123 as never, (value: string) => value.trim());

	expect(isError(failed)).toBe(true);
});

test('return types', () => {
	const basicFlow = attemptFlow(
		() => 'Initial value!',
		() => attempt(() => 'Returned value!'),
	)();

	const basicPipe = attemptPipe(
		() => {},
		() => attempt(() => 'Test value!'),
	);

	expect(isOk(basicFlow)).toBe(true);
	expect(isOk(basicPipe)).toBe(true);

	expect((basicFlow as unknown as Ok<string>).value).toBe('Returned value!');
	expect((basicPipe as unknown as Ok<string>).value).toBe('Test value!');

	const errorFlow = attemptFlow(
		() => {},
		() =>
			attempt(() => {
				throw new Error('Test error!');
			}),
	)();

	const errorPipe = attemptPipe(
		() => {},
		() =>
			attempt(() => {
				throw new Error('Test error!');
			}),
	);

	expect(isError(errorFlow)).toBe(true);
	expect(isError(errorPipe)).toBe(true);

	expect((errorFlow as Err<never, Error>).error.message).toBe('Test error!');
	expect((errorPipe as Err<never, Error>).error.message).toBe('Test error!');

	const promiseFailFlow = attemptFlow(
		() => {},
		() => Promise.resolve(),
	)();

	const promiseFailPipe = attemptPipe(
		() => {},
		() => Promise.resolve(),
	);

	expect(isError(promiseFailFlow)).toBe(true);
	expect(isError(promiseFailPipe)).toBe(true);

	expect((promiseFailFlow as Err<never, Error>).error.message).toBe(WORK_MESSAGE_FLOW_PROMISE);

	expect((promiseFailPipe as Err<never, Error>).error.message).toBe(WORK_MESSAGE_PIPE_PROMISE);

	const nestingFailFlow = attemptFlow(
		() => {},
		() => () => () => {},
	)();

	const nestingFailPipe = attemptPipe(
		() => {},
		() => () => () => {},
	);

	expect(isError(nestingFailFlow)).toBe(true);
	expect(isError(nestingFailPipe)).toBe(true);

	expect((nestingFailFlow as Err<never, Error>).error.message).toBe(
		'Return values are too deeply nested.',
	);

	expect((nestingFailPipe as Err<never, Error>).error.message).toBe(
		'Return values are too deeply nested.',
	);
});
