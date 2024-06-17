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
	const first = emitter(0);
	const second = emitter(0);
	const third = emitter(0);

	const results = {
		first: {
			complete: false,
			count: 0,
			error: null,
		},
		second: {
			complete: false,
			count: 0,
			error: null,
		},
	};

	const one = first.observable.subscribe({
		complete() {
			results.first.complete = true;
		},
		next() {
			results.first.count += 1;
		},
		error(error) {
			results.first.error = error as never;
		},
	});

	const two = second.observable.subscribe(
		() => {
			results.second.count += 1;
		},
		error => {
			results.second.error = error as never;
		},
		() => {
			results.second.complete = true;
		},
	);

	const three = first.observable.subscribe({});

	expect(first.active).toBe(true);
	expect(second.active).toBe(true);
	expect(third.active).toBe(true);

	expect(one.closed).toBe(false);
	expect(two.closed).toBe(false);
	expect(three.closed).toBe(false);

	expect(results.first.complete).toBe(false);
	expect(results.first.count).toBe(1);
	expect(results.first.error).toBe(null);

	expect(results.second.complete).toBe(false);
	expect(results.second.count).toBe(1);
	expect(results.second.error).toBe(null);

	first.emit(1);
	second.error(new Error('test'));
	third.finish();

	wait(() => {
		expect(third.active).toBe(false);

		expect(results.first.complete).toBe(false);
		expect(results.first.count).toBe(2);
		expect(results.first.error).toBe(null);

		expect(results.second.complete).toBe(false);
		expect(results.second.count).toBe(1);
		expect(results.second.error).toBeInstanceOf(Error);

		first.emit(2, true);
		second.error(new Error('test'), true);

		three.unsubscribe();

		wait(() => {
			expect(first.active).toBe(false);
			expect(second.active).toBe(false);

			expect(one.closed).toBe(true);
			expect(two.closed).toBe(true);
			expect(three.closed).toBe(true);

			expect(results.first.complete).toBe(true);
			expect(results.first.count).toBe(3);
			expect(results.first.error).toBe(null);

			expect(results.second.complete).toBe(true);
			expect(results.second.count).toBe(1);
			expect(results.second.error).toBeInstanceOf(Error);

			done();
		});
	});
});
