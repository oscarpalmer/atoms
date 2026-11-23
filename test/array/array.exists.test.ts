import {expect, test} from 'vite-plus/test';
import {exists} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('exists', () => {
	const {complex, simple} = arrayFixture;

	expect(exists(simple, 2)).toBe(true);
	expect(exists(simple, 10)).toBe(false);

	const existsByKeyCallback = exists(complex, item => item.id, 3);
	const existsByKeyValue = exists(complex, 'id', 3);

	expect(existsByKeyCallback).toBe(true);
	expect(existsByKeyValue).toBe(true);

	const existsByValueCallback = exists(complex, item => item.id === 3);

	expect(existsByValueCallback).toBe(true);

	expect(exists('blah' as never, 99)).toBe(false);
	expect(exists([1, 2, 3], 99)).toBe(false);
	expect(exists([], 99)).toBe(false);
	expect(exists([1, 2, 3], [] as never)).toBe(false);
	expect(exists([1, 2, 3], [] as never, [] as never)).toBe(false);
});
