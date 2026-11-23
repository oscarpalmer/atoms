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
import {PLAN_MESSAGE_FAIL_PROMISE, PLAN_MESSAGE_SUCCEED_PROMISE} from '../../src/models/plan.model';
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

	const ranFirst = await run.attempt(simple, [123] as never, first.signal);
	const ranSecond = await run.attempt(complex, ['third'], second.signal);
	const ranThird = await run.attempt(simple, third.signal);

	expect(isError(ranFirst)).toBe(true);
	expect(isError(ranSecond)).toBe(true);
	expect(isError(ranThird)).toBe(true);

	expect((ranFirst as unknown as Err<never, string>).error).toBe('aborted first');
	expect((ranSecond as unknown as Err<never, string>).error).toBe('aborted second');
	expect((ranThird as unknown as Err<never, string>).error).toBe('aborted third');
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

	function* syncFailingPromise() {
		// @ts-expect-error Testing promise in sync
		yield* fail(() => new Promise(resolve => resolve('yay')));
	}

	const thrown = getThrown(() => run(syncFailingPromise));

	expect(thrown).toBeInstanceOf(Error);
	expect((thrown as Error).message).toBe(PLAN_MESSAGE_FAIL_PROMISE);

	async function* asyncFailingBasic() {
		yield* fail('error');
		yield* succeed('yay');

		return 'default';
	}

	await expect(run(asyncFailingBasic)).rejects.toBe('error');

	async function* asyncFailingFn() {
		yield* fail(() => 'error');
		yield* succeed('yay');

		return 'default';
	}

	await expect(run(asyncFailingFn)).rejects.toBe('error');

	async function* asyncFailingPromiseBasic() {
		yield* fail(new Promise(resolve => resolve('error')));
		yield* succeed('yay');

		return 'default';
	}

	await expect(run(asyncFailingPromiseBasic)).rejects.toBe('error');

	async function* asyncFailingPromiseFn() {
		yield* fail(async () => new Promise(resolve => resolve('error')));
		yield* succeed('yay');

		return 'default';
	}

	await expect(run(asyncFailingPromiseFn)).rejects.toBe('error');
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

	function* syncSucceedingPromise() {
		// @ts-expect-error Testing promise in sync
		yield* succeed(() => new Promise(resolve => resolve('yay')));
	}

	const thrown = getThrown(() => run(syncSucceedingPromise));

	expect(thrown).toBeInstanceOf(Error);
	expect((thrown as Error).message).toBe(PLAN_MESSAGE_SUCCEED_PROMISE);

	async function* asyncSucceedingBasic() {
		const result = yield* succeed(123);

		return `result: ${result}`;
	}

	await run(asyncSucceedingBasic).then(result => {
		expect(result).toBe('result: 123');
	});

	async function* asyncSucceedingFn() {
		const result = yield* succeed(() => 123);

		return `result: ${result}`;
	}

	await run(asyncSucceedingFn).then(result => {
		expect(result).toBe('result: 123');
	});

	async function* asyncSucceedingPromiseBasic() {
		const result = yield* succeed(new Promise<number>(resolve => resolve(123)));

		return `result: ${result}`;
	}

	await run(asyncSucceedingPromiseBasic).then(result => {
		expect(result).toBe('result: 123');
	});

	async function* asyncSucceedingPromiseFn() {
		const result = yield* succeed(async () => new Promise<number>(resolve => resolve(123)));

		return `result: ${result}`;
	}

	await run(asyncSucceedingPromiseFn).then(result => {
		expect(result).toBe('result: 123');
	});
});

test('rejected promises in synchronous plans are not unhandled', async () => {
	function* failing() {
		// @ts-expect-error Testing promise in sync
		yield* fail(() => Promise.reject(new Error('Test error')));
	}

	function* succeeding() {
		// @ts-expect-error Testing promise in sync
		yield* succeed(() => Promise.reject(new Error('Test error')));
	}

	expect(getThrown(() => run(failing))).toBeInstanceOf(Error);
	expect(getThrown(() => run(succeeding))).toBeInstanceOf(Error);

	await new Promise(resolve => setTimeout(resolve, 10));
});
