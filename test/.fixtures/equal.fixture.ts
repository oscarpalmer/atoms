export class TestEqualItem {
	constructor(readonly value: number) {}
}

const anyValues = [
	null,
	undefined,
	false,
	true,
	0,
	1,
	'',
	'a',
	/./,
	[],
	{},
	new ArrayBuffer(8),
	new DataView(new ArrayBuffer(8)),
	new Date(),
	new Error('foo'),
	new Map(),
	new Set(),
	Symbol('abc'),
];

const arrayBuffers = [new ArrayBuffer(8), new ArrayBuffer(8), new ArrayBuffer(16)];

const dataViews = [
	new DataView(new ArrayBuffer(8)),
	new DataView(new ArrayBuffer(8)),
	new DataView(new ArrayBuffer(16)),
	new DataView(new ArrayBuffer(8), 0),
	new DataView(new ArrayBuffer(8), 1),
];

const firstDate = new Date();

const dates = [firstDate, new Date(firstDate.getTime()), new Date(firstDate.getTime() + 1_000)];

const errors = [new Error('foo'), new Error('foo'), new Error('bar')];

const maps = [
	new Map([
		['a', 1],
		['b', 2],
		['c', 3],
	]),
	new Map([
		['a', 1],
		['b', 2],
		['c', 3],
	]),
];

const primitives = [
	[null, null, true],
	[undefined, undefined, true],
	[null, undefined, false],

	[false, false, true],
	[true, true, true],
	[false, true, false],

	[0, 0, true],
	[1, 1, true],
	[0, 1, false],

	['', '', true],
	['a', 'a', true],
	['', 'a', false],

	[123, '123', false],
];

const references = [
	{
		date: firstDate,
		nested: {
			date: firstDate,
			type: 0,
		},
	},

	{
		date: firstDate,
		nested: {
			date: firstDate,
			type: 1,
		},
	},
];

const sets = [
	[new Set([1, 2, 3]), new Set([3, 2, 1])],
	[new Set([1, 2, 3]), new Set([97, 98, 99])],
];

const strings = ['hElLo WoRlD', 'hello world'];

const symbols = [Symbol('abc'), Symbol('abc')];

const typedArrays = [
	[
		new Int8Array([1, 2, 3]),
		new Uint8Array([1, 2, 3]),
		new Uint8ClampedArray([1, 2, 3]),
		new Int16Array([1, 2, 3]),
		new Uint16Array([1, 2, 3]),
		new Int32Array([1, 2, 3]),
		new Uint32Array([1, 2, 3]),
		new Float32Array([1, 2, 3]),
		new Float64Array([1, 2, 3]),
		new BigInt64Array([1n, 2n, 3n]),
		new BigUint64Array([1n, 2n, 3n]),
	],
	[
		new Int8Array([1, 2, 3]),
		new Uint8Array([1, 2, 3]),
		new Uint8ClampedArray([1, 2, 3]),
		new Int16Array([1, 2, 3]),
		new Uint16Array([1, 2, 3]),
		new Int32Array([1, 2, 3]),
		new Uint32Array([1, 2, 3]),
		new Float32Array([1, 2, 3]),
		new Float64Array([1, 2, 3]),
		new BigInt64Array([1n, 2n, 3n]),
		new BigUint64Array([1n, 2n, 3n]),
	],
	[
		new Int8Array([3, 2, 1]),
		new Uint8Array([3, 2, 1]),
		new Uint8ClampedArray([3, 2, 1]),
		new Int16Array([3, 2, 1]),
		new Uint16Array([3, 2, 1]),
		new Int32Array([3, 2, 1]),
		new Uint32Array([3, 2, 1]),
		new Float32Array([3, 2, 1]),
		new Float64Array([3, 2, 1]),
		new BigInt64Array([3n, 2n, 1n]),
		new BigUint64Array([3n, 2n, 1n]),
	],
	[
		new Int8Array([4, 5, 6, 7, 8, 9]),
		new Uint8Array([4, 5, 6, 7, 8, 9]),
		new Uint8ClampedArray([4, 5, 6, 7, 8, 9]),
		new Int16Array([4, 5, 6, 7, 8, 9]),
		new Uint16Array([4, 5, 6, 7, 8, 9]),
		new Int32Array([4, 5, 6, 7, 8, 9]),
		new Uint32Array([4, 5, 6, 7, 8, 9]),
		new Float32Array([4, 5, 6, 7, 8, 9]),
		new Float64Array([4, 5, 6, 7, 8, 9]),
		new BigInt64Array([4n, 5n, 6n, 7n, 8n, 9n]),
		new BigUint64Array([4n, 5n, 6n, 7n, 8n, 9n]),
	],
];

export const equalFixture = {
	anyValues,
	arrayBuffers,
	dataViews,
	dates,
	errors,
	maps,
	primitives,
	references,
	sets,
	strings,
	symbols,
	typedArrays,
};
