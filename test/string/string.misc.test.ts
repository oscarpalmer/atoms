import {expect, test} from 'vitest';
import {dedent, getString, getUuid, join, parse, template, trim, truncate, words} from '../../src';
import {
	TestStringItemWithToString,
	TestStringItemWithoutToString,
	stringFixture,
} from '../.fixtures/string.fixture';

test('dedent', () => {
	for (let index = 0; index < stringFixture.indentations.cases.length; index += 1) {
		expect(dedent(stringFixture.indentations.cases[index])).toBe(
			stringFixture.indentations.results[index],
		);
	}

	expect(dedent`	<div>
		<p>Hello, ${123}!</p>
</div>				`).toBe(`<div>
	<p>Hello, 123!</p>
</div>`);

	expect(dedent(123 as never)).toBe('');
});

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
	expect(getString(() => {})).toBe('');
	expect(getString(() => 'test')).toBe('test');
	expect(getString(new TestStringItemWithoutToString('test'))).toBe('{"value":"test"}');
	expect(getString(new TestStringItemWithToString('test'))).toBe('test');

	const obj = {};

	obj.valueOf = undefined as never;

	expect(getString(obj)).toBe('{}');
});

test(
	'getUuid',
	() =>
		new Promise<void>(done => {
			const ids = new Set<string>();

			const length = 100_000;

			let index = 0;

			for (; index < length; index += 1) {
				ids.add(getUuid());
			}

			expect(ids.size).toBe(length);

			done();
		}),
	60_000,
);

test('join', () => {
	const values = [null, undefined, 'a', '   ', new TestStringItemWithToString('b'), 'c'];

	expect(join(values)).toBe('abc');
	expect(join(values, '.')).toBe('a.b.c');
	expect(join(values, 123 as never)).toBe('abc');

	expect(join([])).toBe('');
	expect(join(123 as never)).toBe('');
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

test('template', () => {
	const basic = '{{a.0.b.1.c}}, {{a.0.b.1.c}}!';
	const custom = '<a.0.b.1.c>, <a.0.b.1.c>!';

	const templater = template.initialize();

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
	expect(templater(custom, variables)).toBe('<a.0.b.1.c>, <a.0.b.1.c>!');

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

	const expected = ['Hello, world!', 'The quick brown fox jum…', 'One morning, when Gre!!!'];

	const suffixes = [undefined, '…', '!!!'];

	const {length} = original;

	for (let index = 0; index < length; index += 1) {
		expect(truncate(original[index], 24, suffixes[index])).toBe(expected[index]);
	}

	expect(truncate('Hello, world!', -99)).toBe('');
	expect(truncate('Hello, world!', 'blah' as never)).toBe('');
	expect(truncate('Hello, world!', 5, 123 as never)).toBe('Hello');

	expect(truncate('blah', 10)).toBe('blah');
	expect(truncate('blah', 1, '…')).toBe('…');
});

test('trim', () => {
	expect(trim('  Hello, world!  ')).toBe('Hello, world!');
	expect(trim('\n\tHello, world!\n\t')).toBe('Hello, world!');
	expect(trim(123 as never)).toBe('');
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
		['Η', 'γρήγορη', 'καφέ', 'αλεπού', 'πηδάει', 'πάνω', 'από', 'το', 'τεμπέλικο', 'σκυλί'],
		['Быстрая', 'коричневая', 'лиса', 'прыгает', 'через', 'ленивую', 'собаку'],
	];

	const {length} = original;

	for (let index = 0; index < length; index += 1) {
		expect(words(original[index])).toEqual(expected[index]);
	}

	expect(words('')).toEqual([]);
	expect(words(123 as never)).toEqual([]);
});
