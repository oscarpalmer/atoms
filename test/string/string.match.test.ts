import {expect, test} from 'vitest';
import {endsWith, includes, startsWith} from '../../src/string';

test('endsWith', () => {
	const values = [
		['Hello, world', 'world', false, true],
		['Hello, world', 'World', false, false],
		['Hello, world', 'World', true, true],
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const [haystack, needle, ignoreCase, expected] = values[index];

		expect(endsWith(haystack as string, needle as string, ignoreCase as boolean)).toBe(expected);
	}

	expect(endsWith(123 as never, 'test')).toBe(false);
	expect(endsWith('Hello, world', 456 as never)).toBe(false);
});

test('includes', () => {
	const values = [
		['Hello, world', 'world', false, true],
		['Hello, world', 'World', false, false],
		['Hello, world', 'World', true, true],
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const [haystack, needle, ignoreCase, expected] = values[index];

		expect(includes(haystack as string, needle as string, ignoreCase as boolean)).toBe(expected);
	}

	expect(includes(123 as never, 'test')).toBe(false);
	expect(includes('Hello, world', 456 as never)).toBe(false);
});

test('startsWith', () => {
	const values = [
		['Hello, world', 'Hello', false, true],
		['Hello, world', 'hello', false, false],
		['Hello, world', 'hello', true, true],
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const [haystack, needle, ignoreCase, expected] = values[index];

		expect(startsWith(haystack as string, needle as string, ignoreCase as boolean)).toBe(expected);
	}

	expect(startsWith(123 as never, 'test')).toBe(false);
	expect(startsWith('Hello, world', 456 as never)).toBe(false);
});
