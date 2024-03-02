import {expect, test} from 'bun:test';
import {createUuid, getString} from '../src/js/string';

test('createUuid', () => {
	const ids = new Set<string>();

	const length = 100_000;

	let index = 0;

	for (; index < length; index += 1) {
		ids.add(createUuid());
	}

	expect(ids.size).toBe(100_000);
});

test('getString', () => {
	expect(getString(undefined)).toBe('undefined');
	expect(getString(null)).toBe('null');
	expect(getString('')).toBe('');
	expect(getString('test')).toBe('test');
	expect(getString(0)).toBe('0');
	expect(getString(1)).toBe('1');
	expect(getString(true)).toBe('true');
	expect(getString(false)).toBe('false');
	expect(getString({})).toBe('[object Object]');
	expect(getString([])).toBe('');
	expect(getString([1, 2, 3])).toBe('1,2,3');
});
