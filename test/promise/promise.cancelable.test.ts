import {expect, test} from 'vitest';
import {cancelable} from '../../src';

test('', () =>
	new Promise<void>(done => {
		const errors: unknown[] = [];
		const results: unknown[] = [];

		const first = cancelable<string>(resolve => {
			setTimeout(() => {
				resolve('ok');
			}, 250);
		});

		void first
			.then(value => {
				errors[0] = false;
				results[0] = value;
			})
			.catch(value => {
				errors[0] = true;
				results[0] = value;
			});

		const second = cancelable<string>(resolve => {
			setTimeout(() => {
				resolve('ok');
			}, 250);
		});

		void second
			.then(value => {
				errors[1] = false;
				results[1] = value;
			})
			.catch(value => {
				errors[1] = true;
				results[1] = value;
			});

		setTimeout(() => {
			second.cancel('canceled');
		}, 125);

		setTimeout(() => {
			expect(errors).toEqual([false, true]);
			expect(results).toEqual(['ok', 'canceled']);

			done();
		}, 500);
	}));
