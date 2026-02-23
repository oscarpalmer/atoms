import {expect, test} from 'vitest';
import {getArray} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	const values = [null, undefined, '', 123, true, Symbol('test'), (): void => {}];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(getArray(values[index])).toEqual([values[index]]);
	}

	expect(getArray(complex)).toEqual(complex);
	expect(getArray(simple)).toEqual(simple);

	const object = {
		123: 'one two three',
		alpha: 'omega',
		999: 'nine nine nine',
		value: {hello: 'world'},
	};

	expect(getArray(object)).toEqual(['one two three', 'nine nine nine', 'omega', {hello: 'world'}]);

	expect(getArray(object, true)).toEqual(['one two three', 'nine nine nine']);

	expect(
		getArray(
			new Map([
				['a', 1],
				['b', 2],
				['c', 3],
			]),
		),
	).toEqual([1, 2, 3]);
	expect(getArray(new Set(['a', 'b', 'c']))).toEqual(['a', 'b', 'c']);
});
