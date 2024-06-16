import {expect, test} from 'bun:test';
import {emitter, wait} from '../src/js';

test('emitter', done => {
	const value = emitter(0);

	expect(value.active).toBe(true);
	expect(value.observable).toBeDefined();
	expect(value.value).toBe(0);

	value.destroy();

	wait(() => {
		expect(value.active).toBe(false);

		done();
	});
});

test('emitter: observable + subscription', done => {
	const value = emitter(0);

	const results = {
		first: {
			completed: false,
			count: 0,
			error: undefined,
			subscription: undefined,
		},
		second: {
			completed: false,
			count: 0,
			error: undefined,
			subscription: undefined,
		},
	};

	const first = value.observable.subscribe({
		complete() {
			results.first.completed = true;
		},
		error(value) {
			results.first.error = value as never;
		},
		next() {
			results.first.count += 1;
		},
	});

	const second = value.observable.subscribe(
		() => {
			results.second.count += 1;
		},
		error => {
			results.second.error = error as never;
		},
		() => {
			results.second.completed = true;
		},
	);

	wait(() => {
		expect(results.first.completed).toBe(false);
		expect(results.first.count).toBe(1);
		expect(results.first.error).toBeUndefined();
		expect(first.closed).toBe(false);

		expect(results.second.completed).toBe(false);
		expect(results.second.count).toBe(1);
		expect(results.second.error).toBeUndefined();
		expect(second.closed).toBe(false);

		value.next(1);

		wait(() => {
			expect(results.first.completed).toBe(false);
			expect(results.first.count).toBe(2);
			expect(results.first.error).toBeUndefined();
			expect(first.closed).toBe(false);

			expect(results.second.completed).toBe(false);
			expect(results.second.count).toBe(2);
			expect(results.second.error).toBeUndefined();
			expect(second.closed).toBe(false);

			value.error(new Error('test'));

			wait(() => {
				expect(results.first.completed).toBe(false);
				expect(results.first.count).toBe(2);
				expect(results.first.error).toBeInstanceOf(Error);
				expect(first.closed).toBe(false);

				expect(results.second.completed).toBe(false);
				expect(results.second.count).toBe(2);
				expect(results.second.error).toBeInstanceOf(Error);
				expect(second.closed).toBe(false);

				value.finish();

				wait(() => {
					expect(results.first.completed).toBe(true);
					expect(results.first.count).toBe(2);
					expect(results.first.error).toBeInstanceOf(Error);
					expect(first.closed).toBe(true);

					expect(results.second.completed).toBe(true);
					expect(results.second.count).toBe(2);
					expect(results.second.error).toBeInstanceOf(Error);
					expect(second.closed).toBe(true);

					done();
				});
			});
		});
	});
});
