import {expect, test} from 'vitest';
import {equal} from '../src/value';

test('any', () => {
	const equalizer = equal.initialize({
		relaxedNullish: true,
	});

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

			expect(equalizer(outer, inner)).toBe(
				(outerIndex < 2 && innerIndex < 2) || outerIndex === innerIndex,
			);
		}
	}
});

test('array', () => {
	expect(equal([1, 2, 3], [1, 2, 3])).toBe(true);
	expect(equal([1, 2, 3], [3, 2, 1])).toBe(false);
	expect(equal([1, 2, 3], [1, 2])).toBe(false);

	const first_1 = Array.from({length: 100}, (_, index) => index);
	const second_1 = Array.from({length: 100}, (_, index) => index);

	second_1[2] = second_1[2] + 1;

	expect(equal(first_1, second_1)).toBe(false);

	const first_2 = Array.from({length: 100}, (_, index) => index);
	const second_2 = Array.from({length: 100}, (_, index) => index);

	second_2[98] = second_2[98] + 1;

	expect(equal(first_2, second_2)).toBe(false);

	const first_3 = Array.from({length: 100}, (_, index) => index);
	const second_3 = Array.from({length: 100}, (_, index) => index);

	second_3[50] = 9999;

	expect(equal(first_3, second_3)).toBe(false);

	const first_4 = Array.from({length: 10_000}, (_, index) => index);
	const second_4 = Array.from({length: 10_000}, (_, index) => index);

	second_4[9999] = second_4[9999] + 1;

	expect(equal(first_4, second_4)).toBe(false);
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

	const fourth = new DataView(new ArrayBuffer(8), 0);
	const fifth = new DataView(new ArrayBuffer(8), 1);

	expect(equal(fourth, fifth)).toBe(false);
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

test('options', () => {
	const symbol = Symbol('test');

	const firstObject = {[symbol]: 99, a: 1, b: 2};
	const secondObject = {[symbol]: 99, a: 1, b: 2, c: 3};

	expect(equal(firstObject, secondObject)).toBe(false);

	expect(equal(firstObject, secondObject, {ignoreKeys: 'c'})).toBe(true);
	expect(equal(firstObject, secondObject, {ignoreKeys: ['c']})).toBe(true);
	expect(equal(firstObject, secondObject, {ignoreKeys: /^c/})).toBe(true);
	expect(equal(firstObject, secondObject, {ignoreKeys: [/^c/]})).toBe(true);

	const firstString = 'alpha';
	const secondString = 'aLpHa';

	expect(equal(firstString, secondString)).toBe(false);
	expect(equal(firstString, secondString), {ignoreCase: 123} as never).toBe(false);
	expect(equal(firstString, secondString, true)).toBe(true);
	expect(equal(firstString, secondString, {ignoreCase: true})).toBe(true);
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
	let first = new Set([1, 2, 3]);
	let second = new Set([3, 2, 1]);

	expect(equal(first, second)).toBe(true);

	second.add(4);

	expect(equal(first, second)).toBe(false);

	first = new Set([1, 2, 3]);
	second = new Set([97, 98, 99]);

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

test('typed array', () => {
	const base = [
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
	];

	const first = [
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
	];

	const second = [
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
	];

	const third = [
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
	];

	const {length} = base;

	for (let baseIndex = 0; baseIndex < length; baseIndex += 1) {
		const baseItem = base[baseIndex];

		for (let sameIndex = 0; sameIndex < length; sameIndex += 1) {
			const sameItem = base[sameIndex];

			expect(equal(baseItem, sameItem)).toBe(baseIndex === sameIndex);
		}

		for (let firstIndex = 0; firstIndex < length; firstIndex += 1) {
			const firstItem = first[firstIndex];

			expect(equal(baseItem, firstItem)).toBe(baseIndex === firstIndex);
		}

		for (let secondIndex = 0; secondIndex < length; secondIndex += 1) {
			const secondItem = second[secondIndex];

			expect(equal(baseItem, secondItem)).toBe(false);
		}

		for (let thirdIndex = 0; thirdIndex < length; thirdIndex += 1) {
			const thirdItem = third[thirdIndex];

			expect(equal(baseItem, thirdItem)).toBe(false);
		}
	}
});

test('references', () => {
	const date = new Date();

	const first = {
		date,
		nested: {
			date,
			type: 0,
		},
	};

	const second = {
		date,
		nested: {
			date,
			type: 1,
		},
	};

	expect(equal(first, second)).toBe(false);
});
