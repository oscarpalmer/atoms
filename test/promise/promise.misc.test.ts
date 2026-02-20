import {expect, test} from 'vitest';
import {isFulfilled, isRejected, promises} from '../../src/promise';

test('is', () =>
	new Promise<void>(done => {
		const values = [undefined, null, 1, 'string', {}, [], new Map(), new Set(), () => {}];
		const {length} = values;

		for (let index = 0; index < length; index += 1) {
			const value = values[index];

			expect(isFulfilled(value)).toBe(false);
			expect(isRejected(value)).toBe(false);
		}

		values.splice(0);

		const errors: unknown[] = [];

		void promises([Promise.resolve(1), Promise.reject(new Error('Nope!'))])
			.then(value => {
				values.push(...value);
			})
			.catch(() => {
				errors.push('Error!');
			});

		setTimeout(() => {
			expect(errors.length).toBe(0);
			expect(values.length).toBe(2);

			expect(isFulfilled(values[0])).toBe(true);
			expect(isRejected(values[0])).toBe(false);

			expect(isFulfilled(values[1])).toBe(false);
			expect(isRejected(values[1])).toBe(true);

			done();
		}, 500);
	}));
