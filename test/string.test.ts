import {expect, test} from 'bun:test';
import {
	capitalise,
	createUuid,
	getString,
	titleCase,
	truncate,
} from '../src/js/string';

class ItemWithoutToString {
	constructor(public value: string) {}
}

class ItemWithToString {
	constructor(public value: string) {}

	toString() {
		return this.value;
	}
}

test('capitalise', () => {
	const original = ['', 'a', 'A', 'aPpLe', 'ö', 'Ç', 'η', 'ф'];
	const expected = ['', 'A', 'A', 'Apple', 'Ö', 'Ç', 'Η', 'Ф'];

	const {length} = original;

	let index = 0;

	for (; index < length; index += 1) {
		expect(capitalise(original[index])).toBe(expected[index]);
	}
});

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

test('truncate', () => {
	const original = [
		'Hello, world!',
		'The quick brown fox jumps over the lazy dog',
		'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.',
	];

	const expected = [
		'Hello, world!',
		'The quick brown fox jum…',
		'One morning, when Gre!!!',
	];

	const suffixes = [undefined, '…', '!!!'];

	const {length} = original;

	for (let index = 0; index < length; index += 1) {
		expect(truncate(original[index], 24, suffixes[index])).toBe(
			expected[index],
		);
	}
});

test('titleCase', () => {
	const original = [
		'the quick brown fox jumps over the lazy dog',
		'η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί',
		'быстрая коричневая лиса прыгает через ленивую собаку',
	];

	const expected = [
		'The Quick Brown Fox Jumps Over The Lazy Dog',
		'Η Γρήγορη Καφέ Αλεπού Πηδάει Πάνω Από Το Τεμπέλικο Σκυλί',
		'Быстрая Коричневая Лиса Прыгает Через Ленивую Собаку',
	];

	const {length} = original;

	let index = 0;

	for (; index < length; index += 1) {
		expect(titleCase(original[index])).toBe(expected[index]);
	}
});
