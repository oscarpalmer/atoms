import {expect, test} from 'vite-plus/test';
import {error, fail, isError, plan, run, type Err} from '../../src';
import {getThrown} from '../.fixtures/plan.fixture';

test('errors', () => {
	const items = [
		[
			function* yieldedError() {
				yield new Error('yielded error');

				return 'hello, world';
			},
			new Error('yielded error'),
		],
		[
			function* failError() {
				yield* fail('fail error');

				return 'hello, again';
			},
			'fail error',
		],
		[
			function* resultError() {
				yield error('result error');
			},
			'result error',
		],
		[
			function* returnedError() {
				return new Error('returned error');
			},
			new Error('returned error'),
		],
		[
			function* returnedResultError() {
				return error('returned result error');
			},
			'returned result error',
		],
		[
			function* thrownError() {
				yield;

				throw new Error('thrown error');
			},
			new Error('thrown error'),
		],
	] as [() => Generator, unknown][];

	for (const [generator, expectation] of items) {
		expect(getThrown(() => run(generator))).toEqual(expectation);
		expect(getThrown(() => plan(generator).run())).toEqual(expectation);

		const attempted = plan(generator).attempt();

		expect(isError(attempted)).toBe(true);
		expect((attempted as Err<unknown>).error).toEqual(expectation);
	}
});

test('errors, async', async () => {
	const items = [
		[
			async function* yieldedError() {
				yield new Error('yielded error');

				return 'hello, world';
			},
			new Error('yielded error'),
		],
		[
			async function* failError() {
				yield* fail('fail error');

				return 'hello, again';
			},
			'fail error',
		],
		[
			async function* resultError() {
				yield error('result error');
			},
			'result error',
		],
		[
			async function* returnedError() {
				return new Error('returned error');
			},
			new Error('returned error'),
		],
		[
			async function* returnedResultError() {
				return error('returned result error');
			},
			'returned result error',
		],
		[
			async function* thrownError() {
				yield;

				throw new Error('thrown error');
			},
			new Error('thrown error'),
		],
	] as [() => AsyncGenerator, unknown][];

	for (const [asyncGenerator, expectation] of items) {
		await expect(run.async(asyncGenerator)).rejects.toEqual(expectation);
		await expect(plan(asyncGenerator).run()).rejects.toEqual(expectation);

		const attempted = await plan(asyncGenerator).attempt();

		expect(isError(attempted)).toBe(true);
		expect((attempted as Err<unknown>).error).toEqual(expectation);
	}
});
