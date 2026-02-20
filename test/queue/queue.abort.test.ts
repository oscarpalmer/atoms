import {expect, test} from 'vitest';
import {queue} from '../../src/queue';
import {queueFixture} from '../.fixtures/queue.fixture';

const {asynchronous} = queueFixture;

test('abort', () =>
	new Promise<void>(done => {
		const queued = queue(asynchronous);

		const names = ['First!', 'Second!', 'Third!', 'Fourth!', 'Fifth!'];

		const signals = Array.from({length: 5}, () => new AbortController());

		const errors: unknown[] = [];
		const values: number[] = [];

		signals[0].abort(names[0]);

		expect(() => queued.add([0], signals[0].signal)).toThrow(names[0]);

		for (let index = 1; index < 5; index += 1) {
			void queued
				.add([index], signals[index].signal)
				.promise.then(value => {
					values.push(value ** 2);
				})
				.catch(error => {
					errors.push(error);
				});
		}

		setTimeout(() => {
			signals[1].abort(names[1]);
			signals[2].abort(names[2]);

			queued.pause();
		}, 50);

		setTimeout(() => {
			signals[3].abort(names[3]);

			queued.resume();
		}, 100);

		setTimeout(() => {
			signals[4].abort(names[4]);
		}, 150);

		setTimeout(() => {
			expect(errors).toEqual(names.slice(1));
			expect(values).toEqual([]);

			done();
		}, 600);
	}));
