import {expect, test} from 'vitest';
import {queue} from '../src/queue';

test('same callback', () =>
	new Promise<void>(done => {
		const size = 5;

		let index = 0;
		let value = 0;

		function callback() {
			value += 1;
		}

		for (; index < size; index += 1) {
			queue(callback);
		}

		setTimeout(() => {
			expect(value).toBe(1);

			done();
		}, 125);
	}));

test('different callback', () =>
	new Promise<void>(done => {
		const size = 5;

		let index = 0;
		let value = 0;

		for (; index < size; index += 1) {
			queue(() => {
				value += 1;
			});
		}

		setTimeout(() => {
			expect(value).toBe(size);

			done();
		}, 125);
	}));
