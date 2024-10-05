import {expect, test} from 'vitest';
import {equal} from '../src/js/value';

test('any', () => {
	const values = [
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

	const {length} = values;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const outer = values[outerIndex];

		for (let innerIndex = 0; innerIndex < length; innerIndex += 1) {
			const inner = values[innerIndex];

			expect(equal(outer, inner)).toBe(outerIndex === innerIndex);
		}
	}
});

test('array', () => {
	expect(equal([1, 2, 3], [1, 2, 3])).toBe(true);
	expect(equal([1, 2, 3], [3, 2, 1])).toBe(false);
	expect(equal([1, 2, 3], [1, 2])).toBe(false);
});

test('arry buffer', () => {
	const first = new ArrayBuffer(8);
	const second = new ArrayBuffer(8);
	const third = new ArrayBuffer(16);

	expect(equal(first, second)).toBe(true);
	expect(equal(first, third)).toBe(false);
});

test('data view', () => {
	const first = new DataView(new ArrayBuffer(8));
	const second = new DataView(new ArrayBuffer(8));
	const third = new DataView(new ArrayBuffer(16));

	expect(equal(first, second)).toBe(true);
	expect(equal(first, third)).toBe(false);
});

test('date', () => {
	const first = new Date();
	const second = new Date(first.getTime());
	const third = new Date(first.getTime() + 1_000);

	expect(equal(first, second)).toBe(true);
	expect(equal(first, third)).toBe(false);
});

test('error', () => {
	const first = new Error('foo');
	const second = new Error('foo');
	const third = new Error('bar');

	expect(equal(first, second)).toBe(true);
	expect(equal(first, third)).toBe(false);
});

test('map', () => {
	const first = new Map([
		['a', 1],
		['b', 2],
		['c', 3],
	]);

	const second = new Map([
		['a', 1],
		['b', 2],
		['c', 3],
	]);

	expect(equal(first, second)).toBe(true);

	second.set('d', 4);

	expect(equal(first, second)).toBe(false);

	first.set('e', 5);

	expect(equal(first, second)).toBe(false);

	first.delete('e');
	second.delete('d');

	first.set('a', 99);

	expect(equal(first, second)).toBe(false);
});

test('object', () => {
	expect(equal({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
	expect(equal({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
	expect(equal({a: 1, b: 2}, {a: 1, b: 3})).toBe(false);
	expect(equal({a: 1, b: 2}, {a: 1})).toBe(false);
});

test('primitive', () => {
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

	for (const [first, second, result] of primitives) {
		expect(equal(first, second)).toBe(result as never);
	}

	const firstLaxString = 'hElLo WoRlD';
	const secondLaxString = 'hello world';

	expect(equal(firstLaxString, secondLaxString)).toBe(false);
	expect(equal(firstLaxString, secondLaxString, true)).toBe(true);
});

test('regular expression', () => {
	expect(equal(/foo/, /foo/)).toBe(true);
	expect(equal(/foo/g, /foo/i)).toBe(false);
	expect(equal(/foo/, /bar/)).toBe(false);
});

test('set', () => {
	const first = new Set([1, 2, 3]);
	const second = new Set([3, 2, 1]);

	expect(equal(first, second)).toBe(true);

	second.add(4);

	expect(equal(first, second)).toBe(false);

	const firstNested = new Set([{id: 1}, {id: 2}]);
	const secondNested = new Set([{id: 2}, {id: 1}]);

	expect(equal(firstNested, secondNested)).toBe(true);
});

test('symbol', () => {
	const first = Symbol('abc');
	const second = Symbol('abc');

	expect(equal(first, first)).toBe(true);
	expect(equal(first, second)).toBe(false);
});
