import {expect, test} from 'vitest';
import {template} from '../../src';

test('template: string', () => {
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

test('template: tagged', () => {
	const array = [1, 2, 3];

	const basic = template`Array: ${array}; boolean: ${true}; object: ${{foo: 'bar'}}; variable: {{variable}}`;

	expect(
		basic({
			variable: 'Hello, world!',
		}),
	).toBe('Array: 123; boolean: true; object: {"foo":"bar"}; variable: Hello, world!');

	const templater = template.initialize({
		ignoreCase: true,
		pattern: /<([^>]+)>/g,
	});

	const custom =
		templater`Array: ${array}; boolean: ${true}; object: ${{foo: 'bar'}}; variable: <VaRiAbLe>`({
			variable: 'Hello, world!',
		});

	expect(custom).toBe('Array: 123; boolean: true; object: {"foo":"bar"}; variable: Hello, world!');
});
