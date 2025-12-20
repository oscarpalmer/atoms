import {expect, test} from 'vitest';
import {emitter} from '../src/emitter';

test('emitter', () =>
	new Promise<void>(done => {
		const value = emitter(0);

		expect(value.active).toBe(true);
		expect(value.observable).toBeDefined();
		expect(value.value).toBe(0);

		value.destroy();

		setTimeout(() => {
			expect(value.active).toBe(false);

			try {
				// oxlint-disable-next-line no-unused-expressions: Testing
				value.observable;
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error)?.message).toBe(
					'Cannot retrieve observable from a destroyed emitter',
				);
			}

			done();
		});
	}));

test('emitter: observable + subscription', () =>
	new Promise<void>(done => {
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

		let three = third.observable.subscribe({});

		first.observable.subscribe('blah' as never);

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

		setTimeout(() => {
			expect(results.first.complete).toBe(false);
			expect(results.first.count).toBe(2);
			expect(results.first.error).toBe(null);

			expect(results.second.complete).toBe(false);
			expect(results.second.count).toBe(1);
			expect(results.second.error).toBeInstanceOf(Error);

			first.emit(2, true);
			second.error(new Error('test'), true);

			three.unsubscribe();
			three.unsubscribe();
			three.destroy();
		}, 25);

		setTimeout(() => {
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
		}, 50);

		setTimeout(() => {
			three = third.observable.subscribe({});

			third.destroy();
		}, 75);

		setTimeout(() => {
			expect(third.active).toBe(false);
			expect(three.closed).toBe(true);

			third.emit(1);
			third.error(new Error('test'));
			third.finish();

			const thirdObservable = third.observable;

			try {
				thirdObservable.subscribe({});
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error)?.message).toBe('Cannot subscribe to a destroyed observable');
			}

			done();
		}, 100);
	}));
