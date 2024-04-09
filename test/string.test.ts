import {expect, test} from 'bun:test';
import {createUuid, getString} from '../src/js/string';

class ItemWithoutToString {
	constructor(public value: string) {}
}

class ItemWithToString {
	constructor(public value: string) {}

	toString() {
		return this.value;
	}
}

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
	expect(getString({})).toBe('{}');
	expect(getString([])).toBe('');
	expect(getString([1, 2, 3])).toBe('1,2,3');
	expect(getString(new ItemWithoutToString('test'))).toBe('{"value":"test"}');
	expect(getString(new ItemWithToString('test'))).toBe('test');
});
