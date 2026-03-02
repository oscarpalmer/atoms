import {expect, test} from 'vitest';
import {flow, pipe} from '../../src';

test('flow: asynchronous', async () => {
	const nameTransformer = flow.async(
		async (name: string) => name.trim(),
		async name => name.split(' '),
		async parts => parts.map(part => part[0].toUpperCase() + part.slice(1)),
		async parts => parts.join(' '),
	);

	expect(await nameTransformer('  oscar de la renta  ')).toBe('Oscar De La Renta');

	await expect(nameTransformer(123 as never)).rejects.toThrow(Error);

	expect(() => flow.async(() => {}, 'not a function' as never)).toThrow(
		'Flow expected to receive an array of functions',
	);
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

	expect(() => flow(() => {}, 'not a function' as never)).toThrow(
		'Flow expected to receive an array of functions',
	);
});

test('pipe: asynchronous', async () => {
	const same = await pipe.async(
		123,
		async x => x + 1,
		async x => x * 2,
	);

	const diff = await pipe.async(
		123,
		async x => x + 1,
		async x => String(x),
		async x => `${x} is a number`,
	);

	expect(same).toBe(248);
	expect(diff).toBe('124 is a number');

	expect(await pipe.async(123)).toBe(123);

	await expect(
		pipe.async(123, async (x: number) => x + 1, 'not a function' as never),
	).rejects.toThrow('Pipe expected to receive an array of functions');
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
		'Pipe expected to receive an array of functions',
	);
});
