import {expect, test} from 'vitest';
import {
	camelCase,
	capitalize,
	kebabCase,
	lowerCase,
	pascalCase,
	snakeCase,
	titleCase,
	upperCase,
} from '../../src';
import {stringFixture} from '../.fixtures/string.fixture';

const {strings} = stringFixture;

test('camelCase', () => {
	expect(camelCase('12 feet')).toBe('12Feet');
	expect(camelCase('enable 6h format')).toBe('enable6hFormat');
	expect(camelCase('enable 24 H format')).toBe('enable24HFormat');
	expect(camelCase('too-legit 2-quit')).toBe('tooLegit2Quit');
	expect(camelCase('walk 500 miles')).toBe('walk500Miles');
	expect(camelCase('xhr2_request')).toBe('xhr2Request');
	expect(camelCase('safe HTML')).toBe('safeHtml');
	expect(camelCase('safeHTML')).toBe('safeHtml');
	expect(camelCase('escape HTML entities')).toBe('escapeHtmlEntities');
	expect(camelCase('escapeHTMLEntities')).toBe('escapeHtmlEntities');
	expect(camelCase('XMLHttpRequest')).toBe('xmlHttpRequest');
	expect(camelCase('XmlHTTPRequest')).toBe('xmlHttpRequest');
	expect(camelCase('IDs')).toBe('ids');
	expect(camelCase('Product XMLs')).toBe('productXmls');

	expect(camelCase(123 as never)).toBe('');
	expect(camelCase('')).toBe('');
});

test('capitalize', () => {
	const original = ['', 'a', 'A', 'aPpLe', 'ö', 'Ç', 'η', 'ф'];
	const expected = ['', 'A', 'A', 'Apple', 'Ö', 'Ç', 'Η', 'Ф'];

	const {length} = original;

	let index = 0;

	for (; index < length; index += 1) {
		expect(capitalize(original[index])).toBe(expected[index]);
	}

	expect(capitalize(123 as never)).toBe('');
	expect(capitalize('')).toBe('');
});

test('kebabCase', () => {
	expect(kebabCase('12 feet')).toBe('12-feet');
	expect(kebabCase('enable 6h format')).toBe('enable-6h-format');
	expect(kebabCase('enable 24 H format')).toBe('enable-24-h-format');
	expect(kebabCase('too-legit 2-quit')).toBe('too-legit-2-quit');
	expect(kebabCase('walk 500 miles')).toBe('walk-500-miles');
	expect(kebabCase('xhr2_request')).toBe('xhr2-request');
	expect(kebabCase('safe HTML')).toBe('safe-html');
	expect(kebabCase('safeHTML')).toBe('safe-html');
	expect(kebabCase('escape HTML entities')).toBe('escape-html-entities');
	expect(kebabCase('escapeHTMLEntities')).toBe('escape-html-entities');
	expect(kebabCase('XMLHttpRequest')).toBe('xml-http-request');
	expect(kebabCase('XmlHTTPRequest')).toBe('xml-http-request');
	expect(kebabCase('IDs')).toBe('ids');
	expect(kebabCase('Product XMLs')).toBe('product-xmls');

	expect(kebabCase(123 as never)).toBe('');
	expect(kebabCase('')).toBe('');
});

test('lowercase', () => {
	const expected = [
		'hello, world!',
		'the quick brown fox jumps over the lazy dog',
		'η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί',
		'быстрая коричневая лиса прыгает через ленивую собаку',
	];

	for (let index = 0; index < strings.length; index += 1) {
		expect(lowerCase(strings[index])).toBe(expected[index]);
	}

	expect(lowerCase(123 as never)).toBe('');
});

test('pascalCase', () => {
	expect(pascalCase('12 feet')).toBe('12Feet');
	expect(pascalCase('enable 6h format')).toBe('Enable6hFormat');
	expect(pascalCase('enable 24 H format')).toBe('Enable24HFormat');
	expect(pascalCase('too-legit 2-quit')).toBe('TooLegit2Quit');
	expect(pascalCase('walk 500 miles')).toBe('Walk500Miles');
	expect(pascalCase('xhr2_request')).toBe('Xhr2Request');
	expect(pascalCase('safe HTML')).toBe('SafeHtml');
	expect(pascalCase('safeHTML')).toBe('SafeHtml');
	expect(pascalCase('escape HTML entities')).toBe('EscapeHtmlEntities');
	expect(pascalCase('escapeHTMLEntities')).toBe('EscapeHtmlEntities');
	expect(pascalCase('XMLHttpRequest')).toBe('XmlHttpRequest');
	expect(pascalCase('XmlHTTPRequest')).toBe('XmlHttpRequest');
	expect(pascalCase('IDs')).toBe('Ids');
	expect(pascalCase('Product XMLs')).toBe('ProductXmls');

	expect(pascalCase(123 as never)).toBe('');
	expect(pascalCase('')).toBe('');
});

test('snakeCase', () => {
	expect(snakeCase('12 feet')).toBe('12_feet');
	expect(snakeCase('enable 6h format')).toBe('enable_6h_format');
	expect(snakeCase('enable 24 H format')).toBe('enable_24_h_format');
	expect(snakeCase('too_legit 2_quit')).toBe('too_legit_2_quit');
	expect(snakeCase('walk 500 miles')).toBe('walk_500_miles');
	expect(snakeCase('xhr2_request')).toBe('xhr2_request');
	expect(snakeCase('safe HTML')).toBe('safe_html');
	expect(snakeCase('safeHTML')).toBe('safe_html');
	expect(snakeCase('escape HTML entities')).toBe('escape_html_entities');
	expect(snakeCase('escapeHTMLEntities')).toBe('escape_html_entities');
	expect(snakeCase('XMLHttpRequest')).toBe('xml_http_request');
	expect(snakeCase('XmlHTTPRequest')).toBe('xml_http_request');
	expect(snakeCase('IDs')).toBe('ids');
	expect(snakeCase('Product XMLs')).toBe('product_xmls');

	expect(snakeCase(123 as never)).toBe('');
	expect(snakeCase('')).toBe('');
});

test('titleCase', () => {
	const expected = [
		'Hello World',
		'The Quick Brown Fox Jumps Over The Lazy Dog',
		'Η Γρήγορη Καφέ Αλεπού Πηδάει Πάνω Από Το Τεμπέλικο Σκυλί',
		'Быстрая Коричневая Лиса Прыгает Через Ленивую Собаку',
	];

	for (let index = 0; index < strings.length; index += 1) {
		expect(titleCase(strings[index])).toBe(expected[index]);
	}

	expect(titleCase(123 as never)).toBe('');
	expect(titleCase('')).toBe('');
});

test('upperCase', () => {
	const expected = [
		'HELLO, WORLD!',
		'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
		'Η ΓΡΉΓΟΡΗ ΚΑΦΈ ΑΛΕΠΟΎ ΠΗΔΆΕΙ ΠΆΝΩ ΑΠΌ ΤΟ ΤΕΜΠΈΛΙΚΟ ΣΚΥΛΊ',
		'БЫСТРАЯ КОРИЧНЕВАЯ ЛИСА ПРЫГАЕТ ЧЕРЕЗ ЛЕНИВУЮ СОБАКУ',
	];

	for (let index = 0; index < strings.length; index += 1) {
		expect(upperCase(strings[index])).toBe(expected[index]);
	}

	expect(upperCase(123 as never)).toBe('');
});
