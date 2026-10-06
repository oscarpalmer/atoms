import {expect, test} from 'vite-plus/test';
import {error, fail, plan, run} from '../../src';

test('error', () => {
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
				yield fail('fail error');

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
			function* thrownError() {
				yield;

				throw new Error('thrown error');
			},
			new Error('thrown error'),
		],
	] as const;

	for (const [generator, expectation] of items) {
		try {
			run(generator as never);
		} catch (error) {
			expect(error).toEqual(expectation);
		}

		try {
			plan(generator as never).run();
		} catch (error) {
			expect(error).toEqual(expectation);
		}
	}
});

test('error, async', async () => {
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
				yield fail(new Error('fail error'));

				return 'hello, again';
			},
			new Error('fail error'),
		],
		[
			async function* resultError() {
				yield error('result error');
			},
			'result error',
		],
		[
			async function* thrownError() {
				yield;

				throw new Error('thrown error');
			},
			new Error('thrown error'),
		],
	] as const;

	for (const [asyncGenerator, expectation] of items) {
		await run.async(asyncGenerator as never).catch(error => {
			expect(error).toEqual(expectation);
		});

		await plan(asyncGenerator as never)
			.run()
			.catch(error => {
				expect(error).toEqual(expectation);
			});
	}
});
