import {expect, test} from 'vitest';
import {retry, RetryError} from '../../src';

test('asynchronous', async () => {
	const immediate = await retry.async(() => 'Immediate value!');

	expect(immediate).toBe('Immediate value!');

	let attempts = 0;

	const delayed = await retry.async(
		() =>
			new Promise<string>((resolve, reject) => {
				if (attempts < 2) {
					attempts += 1;

					reject(new Error('Failed attempt!'));
				} else {
					resolve('Delayed value!');
				}
			}),
		{times: 3},
	);

	expect(delayed).toBe('Delayed value!');

	attempts = 0;

	try {
		await retry.async(
			() => {
				attempts += 1;
				throw new Error('No when');
			},
			{times: 5, when: () => false},
		);
	} catch {
		expect(attempts).toBe(1);
	}

	await retry
		.async(
			() =>
				new Promise<string>((_, reject) => {
					reject(new Error('Failed attempt!'));
				}),
			{times: 2, when: error => error instanceof Error && error.message === 'Failed attempt!'},
		)
		.catch(error => {
			expect(error).toBeInstanceOf(RetryError);
			expect((error as RetryError).message).toBe('Retry failed');

			expect((error as RetryError).original).toBeInstanceOf(Error);
			expect(((error as RetryError).original as Error).message).toBe('Failed attempt!');
		});

	await expect(retry.async('blah' as never)).rejects.toThrow('Retry expected a function');
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
		{times: 3},
	);

	expect(delayed).toBe('Delayed value!');

	attempts = 0;

	try {
		retry(
			() => {
				attempts += 1;
				throw new Error('No when');
			},
			{times: 5, when: () => false},
		);
	} catch {
		expect(attempts).toBe(1);
	}

	try {
		retry(
			() => {
				throw new Error('Failed attempt!');
			},
			{times: 2, when: error => error instanceof Error && error.message === 'Failed attempt!'},
		);
	} catch (error) {
		expect(error).toBeInstanceOf(RetryError);
		expect((error as RetryError).message).toBe('Retry failed');

		expect((error as RetryError).original).toBeInstanceOf(Error);
		expect(((error as RetryError).original as Error).message).toBe('Failed attempt!');
	}

	expect(() => retry('blah' as never)).toThrow('Retry expected a function');
});
