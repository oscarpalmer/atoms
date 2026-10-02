import {expect, test} from 'vite-plus/test';
import {
	asyncPlan,
	asyncRun,
	Err,
	isAsyncGenerator,
	isAsyncPlan,
	isError,
	isGenerator,
	isOk,
	isPlan,
	isResult,
	Ok,
	plan,
	run,
} from '../src';
import {isFixture} from './.fixtures/is.fixture';

function* a() {
	yield;

	return 'a';
}

function* abc() {
	const aaa = yield* a();
	const bbb = yield* b();
	const ccc = yield* c();

	return `${aaa}${bbb}${ccc}`;
}

function* b() {
	yield;

	return 'b';
}

function* c() {
	yield;

	return 'c';
}

async function* getPrefix() {
	yield new Promise(resolve => setTimeout(resolve, 1000));

	return 'hello';
}

async function* getMessage() {
	const prefix = yield* getPrefix();
	const suffix = getSuffix();

	return `${prefix}${suffix}`;
}

function getSuffix() {
	return ', world!';
}

const {length, values} = isFixture;

test('error', () => {
	const items = [
		[
			function* yieldedError() {
				yield new Error('yielded error');

				return 'hello, world';
			},
			'yielded error',
		],
		[
			function* thrownError() {
				throw new Error('thrown error');
			},
			'thrown error',
		],
	] as const;

	for (const [generator, message] of items) {
		const ranGenerator = run(generator);
		const ranPlan = run(plan(generator));

		expect(isResult(ranGenerator)).toBe(true);
		expect(isResult(ranPlan)).toBe(true);

		expect(isError(ranGenerator)).toBe(true);
		expect(isError(ranPlan)).toBe(true);

		expect(isOk(ranGenerator)).toBe(false);
		expect(isOk(ranPlan)).toBe(false);

		const generatorError = (ranGenerator as Err<Error>).error;
		const planError = (ranPlan as Err<Error>).error;

		expect(generatorError).toBeInstanceOf(Error);
		expect(generatorError.message).toBe(message);

		expect(planError).toBeInstanceOf(Error);
		expect(planError.message).toBe(message);
	}
});

test('error, async', async () => {
	const items = [
		[
			async function* yieldedError() {
				yield new Error('yielded error');

				return 'hello, world';
			},
			'yielded error',
		],
		[
			async function* thrownError() {
				throw new Error('thrown error');
			},
			'thrown error',
		],
	] as const;

	for (const [asyncGenerator, message] of items) {
		const ranGenerator = await asyncRun(asyncGenerator);
		const ranPlan = await asyncRun(asyncPlan(asyncGenerator));

		expect(isResult(ranGenerator)).toBe(true);
		expect(isResult(ranPlan)).toBe(true);

		expect(isError(ranGenerator)).toBe(true);
		expect(isError(ranPlan)).toBe(true);

		expect(isOk(ranGenerator)).toBe(false);
		expect(isOk(ranPlan)).toBe(false);

		const generatorError = (ranGenerator as Err<Error>).error;
		const planError = (ranPlan as Err<Error>).error;

		expect(generatorError).toBeInstanceOf(Error);
		expect(generatorError.message).toBe(message);

		expect(planError).toBeInstanceOf(Error);
		expect(planError.message).toBe(message);
	}
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

	const asyncPlanned = asyncPlan(async function* () {});

	expect(isAsyncGenerator(asyncPlanned)).toBe(false);
	expect(isAsyncPlan(asyncPlanned)).toBe(true);
	expect(isGenerator(asyncPlanned)).toBe(false);
	expect(isPlan(asyncPlanned)).toBe(false);
});

test('plan', () => {
	const planned = plan(abc);

	expect(isAsyncGenerator(planned)).toBe(false);
	expect(isAsyncPlan(planned)).toBe(false);
	expect(isGenerator(planned)).toBe(false);
	expect(isPlan(planned)).toBe(true);

	const ran = planned.run();

	expect(isResult(ran)).toBe(true);
	expect(isError(ran)).toBe(false);
	expect(isOk(ran)).toBe(true);

	expect((ran as Ok<string>).value).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => plan(values[index] as never)).toThrow();
	}
});

test('plan, async', async () => {
	const planned = plan.async(getMessage);

	expect(isAsyncGenerator(planned)).toBe(false);
	expect(isAsyncPlan(planned)).toBe(true);
	expect(isGenerator(planned)).toBe(false);
	expect(isPlan(planned)).toBe(false);

	const ran = await planned.run();

	expect(isResult(ran)).toBe(true);
	expect(isError(ran)).toBe(false);
	expect(isOk(ran)).toBe(true);

	expect((ran as Ok<string>).value).toBe('hello, world!');

	for (let index = 0; index < length; index += 1) {
		expect(() => plan.async(values[index] as never)).toThrow();
	}
});

test('run', () => {
	const planned = plan(abc);

	expect(isPlan(planned)).toBe(true);

	const ranGenerator = run(abc);
	const ranPlan = run(planned);

	expect(isResult(ranGenerator)).toBe(true);
	expect(isResult(ranPlan)).toBe(true);

	expect(isError(ranGenerator)).toBe(false);
	expect(isError(ranPlan)).toBe(false);

	expect(isOk(ranGenerator)).toBe(true);
	expect(isOk(ranPlan)).toBe(true);

	expect((ranGenerator as Ok<string>).value).toBe('abc');
	expect((ranPlan as Ok<string>).value).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => run(values[index] as never)).toThrow();
	}
});

test('run, async', async () => {
	const planned = asyncPlan(getMessage);

	expect(isAsyncPlan(planned)).toBe(true);
	expect(isPlan(planned)).toBe(false);

	const ranGenerator = await asyncRun(getMessage);
	const ranPlan = await planned.run();

	expect(isResult(ranGenerator)).toBe(true);
	expect(isResult(ranPlan)).toBe(true);

	expect(isError(ranGenerator)).toBe(false);
	expect(isError(ranPlan)).toBe(false);

	expect(isOk(ranGenerator)).toBe(true);
	expect(isOk(ranPlan)).toBe(true);

	expect((ranGenerator as Ok<string>).value).toBe('hello, world!');
	expect((ranPlan as Ok<string>).value).toBe('hello, world!');

	let errors = 0;
	let successes = 0;

	for (let index = 0; index < length; index += 1) {
		await asyncRun(values[index] as never)
			.then(() => {
				successes += 1;
			})
			.catch(() => {
				errors += 1;
			});
	}

	expect(errors).toBe(length);
	expect(successes).toBe(0);
});
