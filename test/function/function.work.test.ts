import {expect, test} from 'vite-plus/test';
import {attempt, error, flow, ok, pipe} from '../../src';
import {
	WORK_MESSAGE_FLOW_ARRAY,
	WORK_MESSAGE_FLOW_PROMISE,
	WORK_MESSAGE_NESTING,
	WORK_MESSAGE_PIPE_ARRAY,
	WORK_MESSAGE_PIPE_PROMISE,
} from '../../src/models/function/work.model';

test('flow: asynchronous', async () => {
	const nameTransformer = flow(
		async (name: string) => name.trim(),
		async name => name.split(' '),
		async parts => parts.map(part => part[0].toUpperCase() + part.slice(1)),
		async parts => parts.join(' '),
	);

	expect(await nameTransformer('  oscar de la renta  ')).toBe('Oscar De La Renta');

	await expect(nameTransformer(123 as never)).rejects.toThrow(Error);

	expect(() => flow(() => {}, 'not a function' as never)).toThrow(WORK_MESSAGE_FLOW_ARRAY);

	const handleResult = flow(
		async (_: unknown) => {},
		async () => 'Test value!',
	);

	try {
		await handleResult(error('Test error!'));
	} catch (err) {
		expect(err).toBe('Test error!');
	}

	await expect(handleResult(ok('Should pass'))).resolves.toBe('Test value!');
});

test('flow: synchronous', () => {
	const nameTransformer = flow(
		(name: string) => name.trim(),
		name => name.split(' '),
		parts => parts.map(part => part[0].toUpperCase() + part.slice(1)),
		parts => parts.join(' '),
	);

	expect(nameTransformer('  oscar de la renta  ')).toBe('Oscar De La Renta');

	expect(() => nameTransformer(123 as never)).toThrow(Error);

	expect(() => flow(() => {}, 'not a function' as never)).toThrow(WORK_MESSAGE_FLOW_ARRAY);

	const handleResult = flow(
		(_: unknown) => {},
		() => 'Test value!',
	);

	expect(() => handleResult(error('Test error!'))).toThrow('Test error!');
	expect(handleResult(ok('Should pass'))).toBe('Test value!');
});

test('pipe: asynchronous', async () => {
	const same = await pipe(
		123,
		async x => x + 1,
		async x => x * 2,
	);

	const diff = await pipe(
		123,
		async x => x + 1,
		async x => String(x),
		async x => `${x} is a number`,
	);

	expect(same).toBe(248);
	expect(diff).toBe('124 is a number');

	expect(await pipe(123)).toBe(123);

	expect(() => pipe(123, async (x: number) => x + 1, 'not a function' as never)).toThrow(
		WORK_MESSAGE_PIPE_ARRAY,
	);
});

test('pipe: synchronous', () => {
	const same = pipe(
		123,
		x => x + 1,
		x => x * 2,
	);

	const diff = pipe(
		123,
		x => x + 1,
		x => String(x),
		x => `${x} is a number`,
	);

	expect(same).toBe(248);
	expect(diff).toBe('124 is a number');

	expect(pipe(123)).toBe(123);

	expect(() => pipe(123, (x: number) => x + 1, 'not a function' as never)).toThrow(
		WORK_MESSAGE_PIPE_ARRAY,
	);
});

test('pipe: asynchronous initial values', async () => {
	expect(await pipe(Promise.resolve(1), x => x + 1)).toBe(2);
	expect(
		await pipe(
			async () => 1,
			x => x + 1,
		),
	).toBe(2);
	expect(await pipe(Promise.resolve(ok(3)), x => x + 1)).toBe(4);

	let received: unknown;

	await pipe(Promise.resolve(ok(ok(1))), x => {
		received = x;
	});

	expect(received).toEqual(ok(1));

	await expect(pipe(Promise.resolve(error('failed')), x => x)).rejects.toBe('failed');
});

test('pipe: asynchronous thunks', async () => {
	expect(
		await pipe(
			1,
			async x => x,
			x => () => Promise.resolve(x + 1),
		),
	).toBe(2);

	expect(
		await pipe(
			1,
			async x => x,
			x => () => Promise.resolve(ok(x + 1)),
		),
	).toBe(2);

	await expect(
		pipe(
			1,
			async x => x,
			() => () => Promise.resolve(error('failed')),
		),
	).rejects.toBe('failed');

	let received: unknown;

	await pipe(
		1,
		async x => x,
		x => () => Promise.resolve(ok(ok(x))),
		x => {
			received = x;
		},
	);

	expect(received).toEqual(ok(1));
});

test('pipe: synchronous promises', () => {
	expect(() => pipe((() => Promise.resolve(1)) as never, (x: number) => x)).toThrow(
		WORK_MESSAGE_PIPE_PROMISE,
	);
});

test('return types', async () => {
	expect(
		flow(
			() => 'Initial value!',
			() => attempt(() => 'Returned value!'),
		)(),
	).toBe('Returned value!');

	expect(
		pipe(
			() => {},
			() => attempt(() => 'Test value!'),
		),
	).toBe('Test value!');

	expect(() =>
		flow(
			() => {},
			() =>
				attempt(() => {
					throw new Error('Test error!');
				}),
		)(),
	).toThrow('Test error!');

	expect(() =>
		pipe(
			() => {},
			() =>
				attempt(() => {
					throw new Error('Test error!');
				}),
		),
	).toThrow('Test error!');

	expect(() => flow(() => {}, (() => Promise.resolve()) as never)()).toThrow(
		WORK_MESSAGE_FLOW_PROMISE,
	);

	expect(() => pipe(() => {}, (() => Promise.resolve()) as never)).toThrow(
		WORK_MESSAGE_PIPE_PROMISE,
	);

	expect(() =>
		flow(
			() => {},
			() => () => () => {},
		)(),
	).toThrow(WORK_MESSAGE_NESTING);

	expect(() =>
		pipe(
			() => {},
			() => () => () => {},
		),
	).toThrow(WORK_MESSAGE_NESTING);
});
