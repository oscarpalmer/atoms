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
import {isFixture} from '../.fixtures/is.fixture';
import {getABC, getMessage} from '../.fixtures/plan.fixture';

const {length, values} = isFixture;

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
	function* failing() {
		yield* fail('error');
		yield* succeed('yay');

		return 'default';
	}

	try {
		run(failing);
	} catch (error) {
		expect(error).toBe('error');
	}

	async function* asyncFailing() {
		yield* fail('error');
		yield* succeed('yay');

		return 'default';
	}

	return run.async(asyncFailing).catch(error => {
		expect(error).toBe('error');
	});
});

test('is', () => {
	for (let index = 0; index < length; index += 1) {
		const actual = values[index];

		expect(isAsyncGenerator(actual)).toBe(false);
		expect(isAsyncPlan(actual)).toBe(false);
		expect(isGenerator(actual)).toBe(false);
		expect(isPlan(actual)).toBe(false);
	}

	function* generator() {}

	expect(isAsyncGenerator(generator)).toBe(false);
	expect(isAsyncPlan(generator)).toBe(false);
	expect(isGenerator(generator)).toBe(true);
	expect(isPlan(generator)).toBe(false);

	const planned = plan(function* () {});

	expect(isAsyncGenerator(planned)).toBe(false);
	expect(isAsyncPlan(planned)).toBe(false);
	expect(isGenerator(planned)).toBe(false);
	expect(isPlan(planned)).toBe(true);

	async function* asyncGenerator() {}

	expect(isAsyncGenerator(asyncGenerator)).toBe(true);
	expect(isAsyncPlan(asyncGenerator)).toBe(false);
	expect(isGenerator(asyncGenerator)).toBe(false);
	expect(isPlan(asyncGenerator)).toBe(false);

	const asyncPlanned = plan(async function* () {});

	expect(isAsyncGenerator(asyncPlanned)).toBe(false);
	expect(isAsyncPlan(asyncPlanned)).toBe(true);
	expect(isGenerator(asyncPlanned)).toBe(false);
	expect(isPlan(asyncPlanned)).toBe(false);
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
	function* succeeding() {
		const result = yield* succeed(456);

		return `result: ${result}`;
	}

	expect(run(succeeding)).toBe('result: 456');

	async function* asyncSucceeding() {
		const result = yield* succeed(123);

		return `result: ${result}`;
	}

	return run.async(asyncSucceeding).then(result => {
		expect(result).toBe('result: 123');
	});
});
