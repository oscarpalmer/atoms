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
		1: 'one two three',
		alpha: 'omega',
		5: 'nine nine nine',
		value: {hello: 'world'},
	};

	expect(getArray(object)).toEqual([
		['1', 'one two three'],
		['5', 'nine nine nine'],
		['alpha', 'omega'],
		['value', {hello: 'world'}],
	]);

	expect(getArray(object, true)).toEqual([
		undefined,
		'one two three',
		undefined,
		undefined,
		undefined,
		'nine nine nine',
	]);

	expect(
		getArray(
			new Map([
				['a', 1],
				['b', 2],
				['c', 3],
			]),
		),
	).toEqual([
		['a', 1],
		['b', 2],
		['c', 3],
	]);

	expect(getArray(new Set(['a', 'b', 'c']))).toEqual(['a', 'b', 'c']);
});
