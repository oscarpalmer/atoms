import {expect, test} from 'vitest';
import * as Schema from '../src/schema';

test('basic schema', () => {
	const schema = {
		array: 'array',
		bigint: 'bigint',
		boolean: 'boolean',
		date: 'date',
		function: 'function',
		number: 'number',
		object: 'object',
		string: 'string',
		symbol: 'symbol',
	} satisfies Schema.Schema;

	const basicSchematic = Schema.schematic(schema);

	const first = {
		array: [1, 2, 3],
		bigint: BigInt(1),
		boolean: true,
		date: new Date(),
		function: () => {},
		number: 1,
		object: {},
		string: 'hello, world!',
		symbol: Symbol('a symbol?'),
	};

	const second = {};

	expect(basicSchematic.is(first)).toBe(true);
	expect(basicSchematic.is({...first, date: 99})).toBe(false);
	expect(basicSchematic.is(second)).toBe(false);
	expect(basicSchematic.is({})).toBe(false);
	expect(basicSchematic.is(123)).toBe(false);

	const invalid = {} satisfies Schema.Schema;

	let invalidSchematic = Schema.schematic(invalid);

	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);

	invalidSchematic = Schema.schematic('!!!' as never);

	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);
});

test('complex schema', () => {
	const schema = {
		arrayOrBoolean: ['array', 'boolean'],
		bigintOrString: ['bigint', 'string'],
		booleanOrDateOrNumber: ['boolean', 'date', 'number'],
		dateOrFunction: ['date', 'function'],
		functionOrNumber: ['function', 'number'],
		invalid: 'invalid' as never,
		multipleInvalid: ['invalid', 'invalid'] as never,
		none: [],
		numberOrObject: ['number', 'object'],
		someInvalid: ['number', 'invalid', 'object'] as never,
		symbol: 'symbol',
	} satisfies Schema.Schema;

	const complexSchematic = Schema.schematic(schema);

	const first = {
		arrayOrBoolean: [1, 2, 3],
		bigintOrString: 'hello, world',
		booleanOrDateOrNumber: new Date(),
		dateOrFunction: () => {},
		functionOrNumber: 1,
		numberOrObject: {},
		someInvalid: 1,
		symbol: Symbol('a symbol?'),
	};

	expect(complexSchematic.is(first)).toBe(true);

	const second = {
		arrayOrBoolean: 'invalid',
		bigintOrString: BigInt(1),
		booleanOrDateOrNumber: 'invalid',
		dateOrFunction: 'invalid',
		functionOrNumber: 'invalid',
		numberOrObject: 'invalid',
		someInvalid: 'invalid',
		symbol: 'invalid',
	};

	expect(complexSchematic.is(second)).toBe(false);
});
