import {expect, test} from 'vite-plus/test';
import {retry, RetryError} from '../../src';
import {RETRY_MESSAGE_CALLBACK, RETRY_MESSAGE_VALUE} from '../../src/models/function/retry.model';

test('asynchronous', async () => {
	const immediate = await retry(async () => 'Immediate value!');

	expect(immediate).toBe('Immediate value!');

	let attempts = 0;

	const delayed = await retry(
		async () =>
			new Promise<string>((resolve, reject) => {
				if (attempts < 2) {
					attempts += 1;

					reject(new Error('Failed attempt!'));
				} else {
					resolve('Delayed value!');
				}
			}),
		{
			times: 3,
		},
	);

	expect(delayed).toBe('Delayed value!');

	attempts = 0;

	try {
		await retry(
			async () => {
				attempts += 1;
				throw new Error('No when');
			},
			{
				times: 5,
				when: () => false,
			},
		);
	} catch {
		expect(attempts).toBe(1);
	}

	await retry(
		async () =>
			new Promise<string>((_, reject) => {
				reject(new Error('Failed attempt!'));
			}),
		{
			times: 2,
			when: error => error instanceof Error && error.message === 'Failed attempt!',
		},
	).catch(error => {
		expect(error).toBeInstanceOf(RetryError);
		expect((error as RetryError).message).toBe('Retry failed');

		expect((error as RetryError).original).toBeInstanceOf(Error);
		expect(((error as RetryError).original as Error).message).toBe('Failed attempt!');
	});

	await expect(
		retry(
			async () => {
				throw new Error('Failed attempt!');
			},
			{
				times: 2,
				when: () => {
					throw new Error('Failed when!');
				},
			},
		),
	).rejects.toThrow('Failed when!');

	expect(() => retry('blah' as never)).toThrow(RETRY_MESSAGE_CALLBACK);
});

test('synchronous', () => {
	const immediate = retry(() => 'Immediate value!');

	expect(immediate).toBe('Immediate value!');

	let attempts = 0;

	const delayed = retry(
		() => {
			if (attempts < 2) {
				attempts += 1;

				throw new Error('Failed attempt!');
			}

			return 'Delayed value!';
		},
		{
			times: 3,
		},
	);

	expect(delayed).toBe('Delayed value!');

	attempts = 0;

	try {
		retry(
			() => {
				attempts += 1;
				throw new Error('No when');
			},
			{
				times: 5,
				when: () => false,
			},
		);
	} catch {
		expect(attempts).toBe(1);
	}

	try {
		retry(
			() => {
				throw new Error('Failed attempt!');
			},
			{
				times: 2,
				when: error => error instanceof Error && error.message === 'Failed attempt!',
			},
		);
	} catch (error) {
		expect(error).toBeInstanceOf(RetryError);
		expect((error as RetryError).message).toBe('Retry failed');

		expect((error as RetryError).original).toBeInstanceOf(Error);
		expect(((error as RetryError).original as Error).message).toBe('Failed attempt!');
	}

	expect(() =>
		retry(() => new Promise(resolve => resolve(undefined)), {
			times: 5,
		}),
	).toThrow(RETRY_MESSAGE_VALUE);

	expect(() => retry('blah' as never)).toThrow(RETRY_MESSAGE_CALLBACK);
});

test('synchronous: rejected promises are not unhandled', async () => {
	expect(() => retry((() => Promise.reject(new Error('Test error'))) as never)).toThrow(
		RETRY_MESSAGE_VALUE,
	);

	await new Promise(resolve => setTimeout(resolve, 10));
});
