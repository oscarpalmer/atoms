/** biome-ignore-all lint/style/noMagicNumbers: Testing */
/** biome-ignore-all lint/nursery/useExplicitType: Testing */
/** biome-ignore-all lint/style/useNamingConvention: Testing */
import {expect, test} from 'vitest';
import {
	camelCase,
	capitalize,
	createUuid,
	getString,
	join,
	kebabCase,
	parse,
	pascalCase,
	snakeCase,
	template,
	titleCase,
	truncate,
	words,
} from '../src/string';

class ItemWithoutToString {
	value: string;

	constructor(value: string) {
		this.value = value;
	}
}

class ItemWithToString {
	value: string;

	constructor(value: string) {
		this.value = value;
	}

	toString() {
		return this.value;
	}
}

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

test(
	'createUuid',
	() =>
		new Promise<void>(done => {
			const ids = new Set<string>();

			const length = 100_000;

			let index = 0;

			for (; index < length; index += 1) {
				ids.add(createUuid());
			}

			expect(ids.size).toBe(length);

			done();
		}),
	60_000,
);

test('getString', () => {
	expect(getString(undefined)).toBe('');
	expect(getString(null)).toBe('');
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

	const obj = {};

	obj.valueOf = undefined as never;

	expect(getString(obj)).toBe('{}');
});

test('join', () => {
	expect(join([null, undefined, 'a', new ItemWithToString('b'), 'c'])).toBe(
		'abc',
	);

	expect(
		join([null, undefined, 'a', new ItemWithToString('b'), 'c'], '.'),
	).toBe('a.b.c');
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

test('parse', () => {
	expect(parse('')).toBe(undefined);
	expect(parse('null')).toBe(null);
	expect(parse('undefined')).toBe(undefined);
	expect(parse('true')).toBe(true);
	expect(parse('false')).toBe(false);
	expect(parse('0')).toBe(0);
	expect(parse('1')).toBe(1);
	expect(parse('1.5')).toBe(1.5);
	expect(parse('[]')).toEqual([]);
	expect(parse('[1,2,3]')).toEqual([1, 2, 3]);
	expect(parse('{}')).toEqual({});
	expect(parse('{"a":1}')).toEqual({a: 1});
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

test('template', () => {
	const basic = '{{a.0.b.1.c}}, {{a.0.b.1.c}}!';
	const custom = '<a.0.b.1.c>, <a.0.b.1.c>!';

	const variables = {
		a: [
			{
				B: [
					null,
					{
						c: 'Hello',
					},
				],
			},
		],
	};

	expect(template(basic, variables)).toBe(', !');
	expect(template(custom, variables)).toBe('<a.0.b.1.c>, <a.0.b.1.c>!');

	expect(
		template(basic, variables, {
			ignoreCase: true,
		}),
	).toBe('Hello, Hello!');

	expect(
		template(custom, variables, {
			ignoreCase: true,
			pattern: /<([^>]+)>/g,
		}),
	).toBe('Hello, Hello!');

	expect(template(123 as never, variables)).toBe('');

	expect(template('This will not be {{templated}}', 'blah' as never)).toBe(
		'This will not be {{templated}}',
	);
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

	expect(truncate('Hello, world!', -99)).toBe('');
	expect(truncate('Hello, world!', 'blah' as never)).toBe('');
	expect(truncate('Hello, world!', 5, 123 as never)).toBe('Hello');
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

	expect(titleCase(123 as never)).toBe('');
	expect(titleCase('')).toBe('');
});

test('words', () => {
	const original = [
		'Hello, world!',
		'The quick brown fox jumps over the lazy dog',
		'Η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί',
		'Быстрая коричневая лиса прыгает через ленивую собаку',
	];

	const expected = [
		['Hello', 'world'],
		['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'],
		[
			'Η',
			'γρήγορη',
			'καφέ',
			'αλεπού',
			'πηδάει',
			'πάνω',
			'από',
			'το',
			'τεμπέλικο',
			'σκυλί',
		],
		['Быстрая', 'коричневая', 'лиса', 'прыгает', 'через', 'ленивую', 'собаку'],
	];

	const {length} = original;

	for (let index = 0; index < length; index += 1) {
		expect(words(original[index])).toEqual(expected[index]);
	}

	expect(words('')).toEqual([]);
	expect(words(123 as never)).toEqual([]);
});
