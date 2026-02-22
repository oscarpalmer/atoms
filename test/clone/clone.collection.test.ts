import {expect, test} from 'vitest';
import {clone} from '../../src/value/clone';

test('array', () => {
	const data = [1, 'a', true];
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.push('b');

	expect(data[3]).toBe(undefined);
});

test('map', () => {
	const data = new Map([
		['a', 1],
		['b', 2],
	]);
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.set('c', 3);

	expect(data.get('c')).toBe(undefined);
});

test('set', () => {
	const data = new Set([1, 2, 3]);
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.add(4);

	expect(data.has(4)).toBe(false);
});

test('typed array', () => {
	const arrays = [
		new Uint8Array([1, 2, 3]),
		new Uint8ClampedArray([1, 2, 3]),
		new Uint16Array([1, 2, 3]),
		new Uint32Array([1, 2, 3]),
		new Int8Array([1, 2, 3]),
		new Int16Array([1, 2, 3]),
		new Int32Array([1, 2, 3]),
		new Float32Array([1, 2, 3]),
		new Float64Array([1, 2, 3]),
		new BigUint64Array([1n, 2n, 3n]),
		new BigInt64Array([1n, 2n, 3n]),
	];

	const constructors = [
		Uint8Array,
		Uint8ClampedArray,
		Uint16Array,
		Uint32Array,
		Int8Array,
		Int16Array,
		Int32Array,
		Float32Array,
		Float64Array,
		BigUint64Array,
		BigInt64Array,
	];

	const {length} = arrays;

	for (let index = 0; index < length; index += 1) {
		const array = arrays[index];
		const cloned = clone(array);

		expect(cloned).not.toBe(array);
		expect(cloned).toBeInstanceOf(constructors[index]);
		expect(cloned).toEqual(array);
	}
});
