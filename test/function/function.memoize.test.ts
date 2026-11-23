import {expect, test} from 'vite-plus/test';
import {memoize, noop} from '../../src';

test('function, memoize: asynchronous', async () => {
	const memoized = memoize(async (value: number) => {
		if (value === 99) {
			throw new Error();
		}

		return value * 2;
	});

	expect(memoized.maximum).toBe(1024);
	expect(memoized.size).toBe(0);

	expect(await memoized.run(2)).toBe(4);
	expect(await memoized.run(3)).toBe(6);

	expect(memoized.size).toBe(2);

	expect(await memoized.run(2)).toBe(4);
	expect(await memoized.run(3)).toBe(6);

	expect(memoized.size).toBe(2);

	await expect(memoized.run(99)).rejects.toThrow();

	memoized.clear();

	expect(memoized.size).toBe(0);
});

test('function, memoize: defaults', () => {
	expect(memoize(noop).maximum).toBe(1024);
	expect(memoize(noop, {cacheSize: 128}).maximum).toBe(128);
	expect(memoize(noop, 0 as never).maximum).toBe(1024);
	expect(memoize(noop, {cacheSize: -1}).maximum).toBe(1024);
	expect(memoize(noop, {cacheSize: 'blah' as never}).maximum).toBe(1024);
	expect(memoize(noop, {}).maximum).toBe(1024);
});

test('function, memoize: error', () => {
	expect(() => memoize('blah' as never)).toThrow();
});

test('function, memoize: promise in synchronous', () => {
	const memoized = memoize((value: number) => Promise.resolve(value * 2));

	expect(() => memoized.run(2)).toThrow();
});

test('function, memoize: synchronous', () => {
	const memoized = memoize((value: number) => value * 2);

	expect(memoized.maximum).toBe(1024);
	expect(memoized.size).toBe(0);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBeUndefined();

	expect(memoized.run(2)).toBe(4);
	expect(memoized.run(3)).toBe(6);
	expect(memoized.size).toBe(2);

	expect(memoized.has(2)).toBe(true);
	expect(memoized.has(3)).toBe(true);
	expect(memoized.get(2)).toBe(4);
	expect(memoized.get(3)).toBe(6);

	expect(memoized.run(2)).toBe(4);
	expect(memoized.run(3)).toBe(6);

	expect(memoized.delete(2)).toBe(true);

	expect(memoized.size).toBe(1);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(true);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBe(6);

	memoized.clear();

	expect(memoized.size).toBe(0);

	expect(memoized.has(2)).toBe(false);
	expect(memoized.has(3)).toBe(false);
	expect(memoized.get(2)).toBeUndefined();
	expect(memoized.get(3)).toBeUndefined();

	const keyed = memoize((_: string, value: number) => value * 3);

	expect(keyed.run('a', 2)).toBe(6);
	expect(keyed.run('b', 2)).toBe(6);
	expect(keyed.run('a', 3)).toBe(9);
	expect(keyed.run('b', 3)).toBe(9);

	expect(keyed.size).toBe(4);

	expect(keyed.has('a_2')).toBe(true);
	expect(keyed.has('b_2')).toBe(true);
	expect(keyed.has('a_3')).toBe(true);
	expect(keyed.has('b_3')).toBe(true);

	expect(keyed.get('a_2')).toBe(6);
	expect(keyed.get('b_2')).toBe(6);
	expect(keyed.get('a_3')).toBe(9);
	expect(keyed.get('b_3')).toBe(9);

	keyed.delete('a_2');
	keyed.delete('b_2');
	keyed.delete('a_3');
	keyed.delete('b_3');

	expect(keyed.size).toBe(0);

	expect(keyed.has('a_2')).toBe(false);
	expect(keyed.has('b_2')).toBe(false);
	expect(keyed.has('a_3')).toBe(false);
	expect(keyed.has('b_3')).toBe(false);

	expect(keyed.get('a_2')).toBeUndefined();
	expect(keyed.get('b_2')).toBeUndefined();
	expect(keyed.get('a_3')).toBeUndefined();
	expect(keyed.get('b_3')).toBeUndefined();

	const callbacked = memoize(value => value ** 2, {
		cacheKey: value => value % 2 === 0,
	});

	expect(callbacked.run(2)).toBe(4);
	expect(callbacked.run(4)).toBe(4);
	expect(callbacked.run(3)).toBe(9);
	expect(callbacked.run(5)).toBe(9);

	expect(callbacked.size).toBe(2);

	expect(callbacked.has(true)).toBe(true);
	expect(callbacked.has(false)).toBe(true);

	expect(callbacked.get(true)).toBe(4);
	expect(callbacked.get(false)).toBe(9);

	callbacked.delete(true);
	callbacked.delete(false);

	expect(callbacked.size).toBe(0);

	expect(callbacked.has(true)).toBe(false);
	expect(callbacked.has(false)).toBe(false);

	expect(callbacked.get(true)).toBeUndefined();
	expect(callbacked.get(false)).toBeUndefined();
});

test('function, memoize: asynchronous deduplication', async () => {
	let count = 0;

	const memoized = memoize(async (value: number) => {
		count += 1;

		await new Promise(resolve => setTimeout(resolve, 10));

		return value * 2;
	});

	const results = await Promise.all([memoized.run(2), memoized.run(2), memoized.run(2)]);

	expect(results).toEqual([4, 4, 4]);
	expect(count).toBe(1);
	expect(memoized.size).toBe(1);
	expect(memoized.get(2)).toBeInstanceOf(Promise);

	expect(await memoized.run(2)).toBe(4);
	expect(count).toBe(1);
});

test('function, memoize: asynchronous rejection', async () => {
	let count = 0;

	const memoized = memoize(async (value: number) => {
		count += 1;

		if (count < 3) {
			throw new Error('Test error');
		}

		return value;
	});

	await expect(memoized.run(1)).rejects.toThrow('Test error');
	await Promise.resolve();

	expect(memoized.has(1)).toBe(false);
	expect(memoized.size).toBe(0);

	await expect(memoized.run(1)).rejects.toThrow('Test error');
	await expect(memoized.run(1)).resolves.toBe(1);

	expect(memoized.has(1)).toBe(true);
	expect(count).toBe(3);
});

test('function, memoize: asynchronous rejection after replacement', async () => {
	const rejectors: Array<(reason: unknown) => void> = [];
	const resolvers: Array<(value: number) => void> = [];

	let count = 0;

	const memoized = memoize(
		async () =>
			new Promise<number>((resolve, reject) => {
				count += 1;

				if (count === 1) {
					rejectors.push(reject);
				} else {
					resolvers.push(resolve);
				}
			}),
		{cacheKey: () => 'key'},
	);

	const first = memoized.run();

	memoized.clear();

	const second = memoized.run();

	rejectors[0](new Error('Test error'));

	await expect(first).rejects.toThrow('Test error');

	expect(memoized.has('key')).toBe(true);

	resolvers[0](123);

	expect(await second).toBe(123);
	expect(await memoized.run()).toBe(123);
	expect(count).toBe(2);
});

test('function, memoize: synchronous rejected promises are not unhandled', async () => {
	const memoized = memoize(() => Promise.reject(new Error('Test error')));

	expect(() => memoized.run()).toThrow();

	await new Promise(resolve => setTimeout(resolve, 10));
});
