import {expect, test} from 'vite-plus/test';
import {isGenerator, isPlan, plan, run} from '../src/plan';
import {isFixture} from './.fixtures/is.fixture';

function* a() {
	yield;

	return 'a';
}

function* b() {
	yield;

	return 'b';
}

function* c() {
	yield;

	return 'c';
}

function* abc() {
	const aaa = yield* a();
	const bbb = yield* b();
	const ccc = yield* c();

	return `${aaa}${bbb}${ccc}`;
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

		expect(ranGenerator).toBeInstanceOf(Error);
		expect((ranGenerator as Error).message).toBe(message);

		expect(ranPlan).toBeInstanceOf(Error);
		expect((ranPlan as Error).message).toBe(message);
	}
});

test('is', () => {
	for (let index = 0; index < length; index += 1) {
		const actual = values[index];

		expect(isGenerator(actual)).toBe(false);
		expect(isPlan(actual)).toBe(false);
	}

	function* generator() {}

	expect(isGenerator(generator)).toBe(true);
	expect(isPlan(generator)).toBe(false);

	const planned = plan(function* () {});

	expect(isGenerator(planned)).toBe(false);
	expect(isPlan(planned)).toBe(true);
});

test('plan', () => {
	const planned = plan(abc);

	expect(isPlan(planned)).toBe(true);

	const ran = planned.run();

	expect(ran).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => plan(values[index] as never)).toThrow();
	}
});

test('plan', () => {
	const planned = plan(abc);

	expect(isPlan(planned)).toBe(true);

	const runGenerator = run(abc);
	const runPlan = run(planned);

	expect(runGenerator).toBe('abc');
	expect(runPlan).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => run(values[index] as never)).toThrow();
	}
});
