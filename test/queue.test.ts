import {describe, expect, test} from 'bun:test';
import {wait} from '../src/js/timer';
import {queue} from '../src/js/queue';

describe('queue', () => {
	test('same callback', done => {
		const size = 5;

		let index = 0;
		let value = 0;

		function callback() {
			value += 1;
		}

		for (; index < size; index += 1) {
			queue(callback);
		}

		wait(() => {
			expect(value).toBe(1);

			done();
		}, 125);
	});

	test('different callback', done => {
		const size = 5;

		let index = 0;
		let value = 0;

		for (; index < size; index += 1) {
			queue(() => {
				value += 1;
			});
		}

		wait(() => {
			expect(value).toBe(size);

			done();
		}, 125);
	});
});
