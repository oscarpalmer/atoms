import {expect, test} from 'vitest';
import {isKeyedQueue, isQueue, keyedQueue, queue} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';

const {length, values} = isFixture;

test('isKeyedQueue + isQueue', () => {
	const k = keyedQueue(() => {});
	const q = queue(() => {});

	expect(isKeyedQueue(k)).toBe(true);
	expect(isKeyedQueue(q)).toBe(false);

	expect(isQueue(k)).toBe(false);
	expect(isQueue(q)).toBe(true);

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		expect(isKeyedQueue(value)).toBe(false);
		expect(isQueue(value)).toBe(false);
	}
});
