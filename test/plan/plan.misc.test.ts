import {expect, test} from 'vite-plus/test';
import {
	delay,
	Err,
	fail,
	isAsyncGenerator,
	isAsyncPlan,
	isError,
	isGenerator,
	isPlan,
	plan,
	run,
	succeed,
} from '../../src';
import {getABC, getMessage, getThrown} from '../.fixtures/plan.fixture';

test('abort', async () => {
	const first = new AbortController();
	const second = new AbortController();
	const third = new AbortController();

	async function* complex(result: string) {
		yield await delay(50);

		return result;
	}

	async function* simple() {
		yield await delay(50);

		return 'simple';
	}

	setTimeout(() => {
		first.abort('aborted first');
		second.abort('aborted second');
	}, 25);

	third.abort('aborted third');

	const ranFirst = await run.attempt.async(simple, [123] as never, first.signal);
	const ranSecond = await run.attempt.async(complex, ['third'], second.signal);
	const ranThird = await run.attempt.async(simple, third.signal);

	expect(isError(ranFirst)).toBe(true);
	expect(isError(ranSecond)).toBe(true);
	expect(isError(ranThird)).toBe(true);

	expect((ranFirst as unknown as Err<string>).error).toBe('aborted first');
	expect((ranSecond as unknown as Err<string>).error).toBe('aborted second');
	expect((ranThird as unknown as Err<string>).error).toBe('aborted third');
});

test('fail', async () => {
	function* syncFailingBasic() {
		yield* fail('error');
		yield* succeed('yay');

		return 'default';
	}

	expect(getThrown(() => run(syncFailingBasic))).toBe('error');

	function* syncFailingFn() {
		yield* fail(() => 'error');
		yield* succeed('yay');

		return 'default';
	}

	expect(getThrown(() => run(syncFailingFn))).toBe('error');

	async function* asyncFailingBasic() {
		yield* fail.async('error');
		yield* succeed('yay');

		return 'default';
	}

	await expect(run.async(asyncFailingBasic)).rejects.toBe('error');

	async function* asyncFailingFn() {
		yield* fail.async(() => 'error');
		yield* succeed('yay');

		return 'default';
	}

	await expect(run.async(asyncFailingFn)).rejects.toBe('error');

	async function* asyncFailingPromiseBasic() {
		yield* fail.async(new Promise(resolve => resolve('error')));
		yield* succeed('yay');

		return 'default';
	}

	await expect(run.async(asyncFailingPromiseBasic)).rejects.toBe('error');

	async function* asyncFailingPromiseFn() {
		yield* fail.async(() => new Promise(resolve => resolve('error')));
		yield* succeed('yay');

		return 'default';
	}

	await expect(run.async(asyncFailingPromiseFn)).rejects.toBe('error');
});

test('iterator', async () => {
	const asynchronous = plan(getMessage);
	const synchronous = plan(getABC);

	expect(isAsyncGenerator(asynchronous)).toBe(false);
	expect(isAsyncPlan(asynchronous)).toBe(true);
	expect(isGenerator(asynchronous)).toBe(false);
	expect(isPlan(asynchronous)).toBe(false);

	expect(isAsyncGenerator(synchronous)).toBe(false);
	expect(isAsyncPlan(synchronous)).toBe(false);
	expect(isGenerator(synchronous)).toBe(false);
	expect(isPlan(synchronous)).toBe(true);

	const asynchronousResults = [];

	for await (const result of asynchronous) {
		asynchronousResults.push(result);
	}

	expect(asynchronousResults).toEqual(['prefix', undefined, 'hello, world!']);

	const synchronousResults = [];

	for (const result of synchronous) {
		synchronousResults.push(result);
	}

	expect(synchronousResults).toEqual(['a', 'b', 'c']);
});

test('succeed', async () => {
	function* succeedingBasic() {
		const result = yield* succeed(456);

		return `result: ${result}`;
	}

	expect(run(succeedingBasic)).toBe('result: 456');

	function* succeedingFn() {
		const result = yield* succeed(() => 456);

		return `result: ${result}`;
	}

	expect(run(succeedingFn)).toBe('result: 456');

	async function* asyncSucceedingBasic() {
		const result = yield* succeed.async(123);

		return `result: ${result}`;
	}

	await run.async(asyncSucceedingBasic).then(result => {
		expect(result).toBe('result: 123');
	});

	async function* asyncSucceedingFn() {
		const result = yield* succeed.async(() => 123);

		return `result: ${result}`;
	}

	await run.async(asyncSucceedingFn).then(result => {
		expect(result).toBe('result: 123');
	});

	async function* asyncSucceedingPromiseBasic() {
		const result = yield* succeed.async(new Promise<number>(resolve => resolve(123)));

		return `result: ${result}`;
	}

	await run.async(asyncSucceedingPromiseBasic).then(result => {
		expect(result).toBe('result: 123');
	});

	async function* asyncSucceedingPromiseFn() {
		const result = yield* succeed.async(() => new Promise<number>(resolve => resolve(123)));

		return `result: ${result}`;
	}

	await run.async(asyncSucceedingPromiseFn).then(result => {
		expect(result).toBe('result: 123');
	});
});
