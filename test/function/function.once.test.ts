import {expect, test} from 'vitest';
import {delay, once} from '../../src';
import {TestFunctionItem} from '../.fixtures/function.fixture';

test('asynchronous: reject', async () => {
	const errors: unknown[] = [];

	let error: unknown;

	const fn = once.async(
		() =>
			new Promise<never>((_, reject) => {
				setTimeout(() => {
					reject(new Error('Test error'));
				}, 100);
			}),
	);

	void fn().catch(result => {
		error = result;
	});

	for (let index = 0; index < 10; index += 1) {
		void fn().catch(result => {
			errors.push(result);
		});
	}

	await delay(150);

	expect(fn.error).toBe(true);

	for (let index = 0; index < 10; index += 1) {
		expect(errors[index]).toBe(error);
	}

	void fn().catch(result => {
		expect(result).toBe(error);
	});

	expect(error).toBeInstanceOf(Error);
	expect((error as Error).message).toBe('Test error');
});

test('asynchronous: resolve', async () => {
	const values: TestFunctionItem[] = [];

	let count = 0;
	let value: TestFunctionItem | undefined;

	const fn = once.async(
		() =>
			new Promise<TestFunctionItem>(resolve => {
				count += 1;

				setTimeout(() => {
					resolve(new TestFunctionItem());
				}, 100);
			}),
	);

	expect(count).toBe(0);
	expect(fn.called).toBe(false);
	expect(fn.cleared).toBe(false);
	expect(fn.error).toBe(false);
	expect(fn.finished).toBe(false);

	fn.clear();

	expect(count).toBe(0);
	expect(fn.called).toBe(false);
	expect(fn.cleared).toBe(false);
	expect(fn.error).toBe(false);
	expect(fn.finished).toBe(false);

	void fn().then(result => {
		value = result;
	});

	for (let index = 0; index < 10; index += 1) {
		void fn().then(result => {
			values.push(result);
		});
	}

	await delay(150);

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(false);
	expect(fn.error).toBe(false);
	expect(fn.finished).toBe(true);

	expect(value).toBeInstanceOf(TestFunctionItem);
	expect(values.length).toBe(10);

	for (let index = 0; index < 10; index += 1) {
		expect(values[index]).toBe(value);
	}

	for (let index = 0; index < 10; index += 1) {
		void fn().then(result => {
			expect(result).toBe(value);
		});
	}

	fn.clear();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(true);
	expect(fn.error).toBe(false);
	expect(fn.finished).toBe(true);

	await expect(() => fn()).rejects.toThrow('Once has been cleared');

	expect(value).toBeInstanceOf(TestFunctionItem);
	expect(values.length).toBe(10);

	for (let index = 0; index < 10; index += 1) {
		expect(values[index]).toBe(value);
	}

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(true);
	expect(fn.error).toBe(false);
	expect(fn.finished).toBe(true);

	expect(() => once.async('not a function' as never)).toThrow('Once expected a function');
});

test('synchronous', () => {
	let count = 0;

	const fn = once(() => {
		count += 1;

		return new TestFunctionItem();
	});

	expect(count).toBe(0);
	expect(fn.called).toBe(false);
	expect(fn.cleared).toBe(false);

	fn.clear();

	expect(count).toBe(0);
	expect(fn.called).toBe(false);
	expect(fn.cleared).toBe(false);

	const first = fn();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(false);

	const second = fn();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(false);

	const third = fn();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(false);

	expect(first).toBeInstanceOf(TestFunctionItem);
	expect(first).toBe(second);
	expect(first).toBe(third);

	fn.clear();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(true);

	expect(() => fn()).toThrow('Once has been cleared');

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(true);

	expect(() => once('not a function' as never)).toThrow('Once expected a function');
});
