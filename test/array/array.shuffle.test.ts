import {expect, test} from 'vitest';
import {shuffle} from '../../src/array';
import {equal} from '../../src/internal/value/equal';
import {TestArrayItem, arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex} = arrayFixture;

	let first: TestArrayItem[] | null = null;
	let second: TestArrayItem[] | null = null;

	while (first == null || equal(first, second)) {
		first = shuffle(complex);
	}

	while (second == null || equal(second, first)) {
		second = shuffle(complex);
	}

	expect(first).not.toEqual(complex);
	expect(first).not.toEqual(second);

	expect(shuffle('blah' as never)).toEqual([]);
	expect(shuffle([])).toEqual([]);
	expect(shuffle([1])).toEqual([1]);
});
