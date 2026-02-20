import {expect, test} from 'vitest';
import {exists} from '../../src/array';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	expect(exists(simple, 2)).toBe(true);
	expect(exists(simple, 5)).toBe(false);

	const existsByKeyCallback = exists(complex, item => item.id, 3);
	const existsByKeyValue = exists(complex, 'id', 3);

	expect(existsByKeyCallback).toEqual(true);
	expect(existsByKeyValue).toEqual(true);

	const existsByValueCallback = exists(complex, item => item.id === 3);

	expect(existsByValueCallback).toEqual(true);

	expect(exists('blah' as never, 99)).toBe(false);
	expect(exists([], 99)).toBe(false);
});
