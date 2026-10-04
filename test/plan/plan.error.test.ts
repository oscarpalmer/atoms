import {expect, test} from 'vite-plus/test';
import {fail, plan, run} from '../../src';

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
			function* resultError() {
				yield fail(new Error('plan error'));

				return 'hello, again';
			},
			'plan error',
		],
		[
			function* thrownError() {
				throw new Error('thrown error');
			},
			'thrown error',
		],
	] as const;

	for (const [generator, message] of items) {
		try {
			run(generator as never);
		} catch (error) {
			expect((error as Error).message).toBe(message);
		}

		try {
			plan(generator as never).run();
		} catch (error) {
			expect((error as Error).message).toBe(message);
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
			'yielded error',
		],
		[
			async function* resultError() {
				yield fail(new Error('plan error'));

				return 'hello, again';
			},
			'plan error',
		],
		[
			async function* thrownError() {
				throw new Error('thrown error');
			},
			'thrown error',
		],
	] as const;

	for (const [asyncGenerator, message] of items) {
		await run(asyncGenerator as never).catch(error => {
			expect((error as Error).message).toBe(message);
		});

		await plan(asyncGenerator as never)
			.run()
			.catch(error => {
				expect((error as Error).message).toBe(message);
			});
	}
});
