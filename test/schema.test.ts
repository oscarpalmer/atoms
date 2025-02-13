import {expect, test} from 'vitest';
import * as Schema from '../src/schema';

test('schema', () => {
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
		string: 'string',
		symbol: Symbol('symbol'),
	};

	const second = {};

	expect(basicSchematic.is(first)).toBe(true);
	expect(basicSchematic.is({...first, date: 99})).toBe(false);
	expect(basicSchematic.is(second)).toBe(false);

	const invalid = {} satisfies Schema.Schema;

	let invalidSchematic = Schema.schematic(invalid);

	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);

	invalidSchematic = Schema.schematic('!!!' as never);

	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);
});
