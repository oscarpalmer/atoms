import {expect, test} from 'vitest';
import {toSet} from '../../src/array';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex} = arrayFixture;

	const simpleSet = toSet(complex);
	const keyedSet = toSet(complex, 'id');
	const callbackedSet = toSet(complex, item => item.name);

	expect(simpleSet).toEqual(new Set(complex));
	expect(keyedSet).toEqual(new Set([1, 2, 3, 4, 5]));

	expect(callbackedSet).toEqual(new Set(['Alice', 'Bob', 'Charlie', 'Alice', 'David']));

	expect(toSet(complex, [] as never)).toEqual(new Set(complex));
	expect(toSet('blah' as never)).toEqual(new Set());
});
