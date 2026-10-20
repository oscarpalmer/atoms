import {expect, test} from 'vite-plus/test';
import {
	asyncFail,
	asyncSucceed,
	asyncUse,
	attemptRun,
	Err,
	error,
	fail,
	isError,
	isOk,
	ok,
	Ok,
	plan,
	run,
	succeed,
	use,
} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';

const {length, values} = isFixture;

test('use, async', async () => {
	for (let index = 0; index < length; index += 1) {
		const fn = async function* () {
			const value = values[index];

			const yielded = yield* asyncUse(value);

			expect(yielded).toBe(typeof value === 'function' ? value() : value);
		};

		await fn().next();
	}

	const errored = error('errored');
	const failed = asyncFail('failed');
	const okay = ok('okay');
	const succeeded = asyncSucceed('succeeded');
	const thrown = new Error('thrown');

	const asyncGenerator = async function* () {
		return 'async generator';
	};

	const syncGenerator = function* () {
		return 'generator';
	};

	const planned = plan(async function* () {
		return 'planned';
	});

	const erroredRun = await attemptRun.async(async function* () {
		yield* use.async(errored);

		return 'not errored';
	});

	const failedRun = await attemptRun.async(async function* () {
		yield* use.async(failed);

		return 'not failed';
	});

	const generatorsRun = await attemptRun.async(async function* () {
		const async = yield* use.async(asyncGenerator);
		const sync = yield* use.async(syncGenerator);

		return [async, sync];
	});

	const successfulRun = await attemptRun.async(async function* () {
		const usedOkay = yield* use.async(okay);
		const usedPlanned = yield* use.async(planned);
		const usedSucceeded = yield* use.async(succeeded);

		return [usedOkay, usedPlanned, usedSucceeded];
	});

	const thrownRun = await attemptRun.async(async function* () {
		yield* use.async(thrown);

		return 'not thrown';
	});

	expect(isError(erroredRun)).toBe(true);
	expect((erroredRun as Err<string>).error).toBe('errored');

	expect(isError(failedRun)).toBe(true);
	expect((failedRun as Err<string>).error).toBe('failed');

	expect(isOk(generatorsRun)).toBe(true);
	expect((generatorsRun as Ok<string[]>).value).toEqual(['async generator', 'generator']);

	expect(isOk(successfulRun)).toBe(true);
	expect((successfulRun as Ok<string[]>).value).toEqual(['okay', 'planned', 'succeeded']);

	expect(isError(thrownRun)).toBe(true);
	expect((thrownRun as Err<Error>).error).toBe(thrown);
});

test('use, error', async () => {
	const invalidValues = [
		new Promise(() => {}),
		fail.async(null),
		async function* () {},
		(async function* () {})(),
		plan(async function* () {}),
		use.async(null),
		succeed.async(null),
	];

	for (const invalidValue of invalidValues) {
		expect(() => {
			const fn = function* () {
				yield* use(invalidValue as never);
			};

			fn().next();
		}).toThrow();
	}

	const invalidCallbacks = invalidValues.map(value => () => value);

	for (const invalidCallback of invalidCallbacks) {
		expect(() => {
			const fn = function* () {
				yield* use(invalidCallback as never);
			};

			fn().next();
		}).toThrow();
	}

	expect(() => {
		const fn = function* () {
			yield* use((() => () => {}) as never);
		};

		fn().next();
	}).toThrow();

	const asyncFailingUse = async function* () {
		yield* use.async((() => () => {}) as never);
	};

	const asyncFailingCallbackUse = async function* () {
		yield* use.async((async () => () => {}) as never);
	};

	await expect(run.async(asyncFailingUse)).rejects.toBeInstanceOf(Error);
	await expect(run.async(asyncFailingCallbackUse)).rejects.toBeInstanceOf(Error);
});

test('use, manual iteration', async () => {
	const errored = error('errored');
	const thrown = new Error('thrown');

	for (const value of [errored, thrown]) {
		const expected = value === errored ? errored : error(thrown);

		const syncIterator = use(value)[Symbol.iterator]();

		expect(syncIterator.next()).toEqual({done: false, value: expected});
		expect(syncIterator.next()).toEqual({done: true, value: undefined});

		const asyncIterator = use.async(value)[Symbol.asyncIterator]();

		expect(await asyncIterator.next()).toEqual({done: false, value: expected});
		expect(await asyncIterator.next()).toEqual({done: true, value: undefined});
	}
});

test('use, nested', async () => {
	const syncNestedRun = attemptRun(function* () {
		return yield* use(use('nested'));
	});

	const syncNestedErrorRun = attemptRun(function* () {
		yield* use(use(error('nested error')));

		return 'not errored';
	});

	const asyncNestedRun = await attemptRun.async(async function* () {
		const fromAsync = yield* use.async(use.async('async nested'));
		const fromSync = yield* use.async(use('sync nested'));

		const fromPlan = yield* use.async(
			plan(function* () {
				return 'sync planned';
			}),
		);

		return [fromAsync, fromSync, fromPlan];
	});

	const asyncNestedErrorRun = await attemptRun.async(async function* () {
		yield* use.async(use(error('nested error')));

		return 'not errored';
	});

	expect(isOk(syncNestedRun)).toBe(true);
	expect((syncNestedRun as Ok<string>).value).toBe('nested');

	expect(isError(syncNestedErrorRun)).toBe(true);
	expect((syncNestedErrorRun as Err<string>).error).toBe('nested error');

	expect(isOk(asyncNestedRun)).toBe(true);

	expect((asyncNestedRun as Ok<string[]>).value).toEqual([
		'async nested',
		'sync nested',
		'sync planned',
	]);

	expect(isError(asyncNestedErrorRun)).toBe(true);
	expect((asyncNestedErrorRun as Err<string>).error).toBe('nested error');
});

test('use, sync', () => {
	for (let index = 0; index < length; index += 1) {
		const fn = function* () {
			const value = values[index];

			const yielded = yield* use(value);

			expect(yielded).toBe(typeof value === 'function' ? value() : value);
		};

		fn().next();
	}

	const errored = error('errored');
	const failed = fail('failed');
	const okay = ok('okay');
	const succeeded = succeed('succeeded');
	const thrown = new Error('thrown');

	const generator = function* () {
		return 'generator';
	};

	const planned = plan(function* () {
		return 'planned';
	});

	const erroredRun = attemptRun(function* () {
		yield* use(errored);

		return 'not errored';
	});

	const failedRun = attemptRun(function* () {
		yield* use(failed);

		return 'not failed';
	});

	const generatorRun = attemptRun(function* () {
		const generated = yield* use(generator);

		return generated;
	});

	const successfulRun = attemptRun(function* () {
		const usedOkay = yield* use(okay);
		const usedPlanned = yield* use(planned);
		const usedSucceeded = yield* use(succeeded);

		return [usedOkay, usedPlanned, usedSucceeded];
	});

	const thrownRun = attemptRun(function* () {
		yield* use(thrown);

		return 'not thrown';
	});

	expect(isError(erroredRun)).toBe(true);
	expect((erroredRun as Err<string>).error).toBe('errored');

	expect(isError(failedRun)).toBe(true);
	expect((failedRun as Err<string>).error).toBe('failed');

	expect(isOk(generatorRun)).toBe(true);
	expect((generatorRun as Ok<string>).value).toBe('generator');

	expect(isOk(successfulRun)).toBe(true);
	expect((successfulRun as Ok<string[]>).value).toEqual(['okay', 'planned', 'succeeded']);

	expect(isError(thrownRun)).toBe(true);
	expect((thrownRun as Err<Error>).error).toBe(thrown);
});
