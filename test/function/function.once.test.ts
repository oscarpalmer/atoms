import {expect, test} from 'vite-plus/test';
import {delay, isAsyncOnce, isOnce, once} from '../../src';
import {
	ONCE_MESSAGE_CALLBACK,
	ONCE_MESSAGE_CLEARED,
	ONCE_MESSAGE_PROMISE,
} from '../../src/models/function/once.model';
import {TestFunctionItem} from '../.fixtures/function.fixture';
import {isFixture} from '../.fixtures/is.fixture';

test('asynchronous: reject', async () => {
	const errors: unknown[] = [];

	let error: unknown;

	const fn = once(
		async () =>
			new Promise<never>((_, reject) => {
				setTimeout(() => {
					reject(new Error('Test error'));
				}, 100);
			}),
	);

	void fn.run().catch(result => {
		error = result;
	});

	for (let index = 0; index < 10; index += 1) {
		void fn.run().catch(result => {
			errors.push(result);
		});
	}

	await delay(150);

	expect(fn.error).toBe(true);

	for (let index = 0; index < 10; index += 1) {
		expect(errors[index]).toBe(error);
	}

	void fn.run().catch(result => {
		expect(result).toBe(error);
	});

	expect(error).toBeInstanceOf(Error);
	expect((error as Error).message).toBe('Test error');
});

test('asynchronous: resolve', async () => {
	const values: TestFunctionItem[] = [];

	let count = 0;
	let value: TestFunctionItem | undefined;

	const fn = once(
		async () =>
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

	void fn.run().then(result => {
		value = result;
	});

	for (let index = 0; index < 10; index += 1) {
		void fn.run().then(result => {
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
		void fn.run().then(result => {
			expect(result).toBe(value);
		});
	}

	fn.clear();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(true);
	expect(fn.error).toBe(false);
	expect(fn.finished).toBe(true);

	await expect(() => fn.run()).rejects.toThrow(ONCE_MESSAGE_CLEARED);

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

	expect(() => once('not a function' as never)).toThrow(ONCE_MESSAGE_CALLBACK);
});

test('is', () => {
	expect(once.is).toBe(isOnce);
	expect(once.isAsync).toBe(isAsyncOnce);

	const {length, values} = isFixture;

	for (let index = 0; index < length; index += 1) {
		expect(isOnce(values[index])).toBe(false);
		expect(isAsyncOnce(values[index])).toBe(false);
	}

	const sync = once(() => {});
	const async = once(async () => new Promise<void>(resolve => resolve()));

	expect(isOnce(sync)).toBe(true);
	expect(isAsyncOnce(sync)).toBe(false);

	expect(isOnce(async)).toBe(false);
	expect(isAsyncOnce(async)).toBe(true);
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

	const first = fn.run();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(false);

	const second = fn.run();

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(false);

	const third = fn.run();

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

	expect(() => fn.run()).toThrow(ONCE_MESSAGE_CLEARED);

	expect(count).toBe(1);
	expect(fn.called).toBe(true);
	expect(fn.cleared).toBe(true);

	const async = once(() => new Promise<void>(resolve => resolve()));

	expect(() => async.run()).toThrow(ONCE_MESSAGE_PROMISE);

	expect(() => once('not a function' as never)).toThrow(ONCE_MESSAGE_CALLBACK);
});

test('synchronous: failures can be retried', () => {
	let count = 0;

	const throwing = once(() => {
		count += 1;

		if (count < 3) {
			throw new Error('Test error');
		}

		return count;
	});

	expect(() => throwing.run()).toThrow('Test error');
	expect(throwing.called).toBe(false);

	expect(() => throwing.run()).toThrow('Test error');
	expect(throwing.called).toBe(false);

	expect(throwing.run()).toBe(3);
	expect(throwing.called).toBe(true);

	expect(throwing.run()).toBe(3);
	expect(count).toBe(3);

	let promised = 0;

	const promising = once((() => {
		promised += 1;

		return Promise.resolve(promised);
	}) as never);

	expect(() => promising.run()).toThrow(ONCE_MESSAGE_PROMISE);
	expect(() => promising.run()).toThrow(ONCE_MESSAGE_PROMISE);
	expect(promising.called).toBe(false);
	expect(promised).toBe(2);
});

test('synchronous: rejected promises are not unhandled', async () => {
	const fn = once((() => Promise.reject(new Error('Test error'))) as never);

	expect(() => fn.run()).toThrow(ONCE_MESSAGE_PROMISE);

	await delay(10);
});
