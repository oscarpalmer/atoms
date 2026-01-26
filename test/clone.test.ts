import {expect, test} from 'vitest';
import {isPlainObject} from '../src/internal/is';
import type {PlainObject} from '../src/models';
import {clone, getValue} from '../src/value';

class Test {
	name: string;

	constructor(
		readonly id: number,
		name: string,
	) {
		this.name = name;
	}

	clone(): Test {
		return new Test(this.id, 'clone');
	}

	custom(): Test {
		return new Test(this.id, 'custom');
	}
}

test('array', () => {
	const data = [1, 'a', true];
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.push('b');

	expect(data[3]).toBe(undefined);
});

test('array buffer', () => {
	const data = new ArrayBuffer(8);
	const cloned = clone(data);

	expect(cloned).not.toBe(data);
	expect(cloned.byteLength).toBe(data.byteLength);
});

test('data view', () => {
	const data = new DataView(new ArrayBuffer(8));
	const cloned = clone(data);

	expect(cloned).not.toBe(data);
	expect(cloned.byteLength).toBe(data.byteLength);
	expect(cloned.byteOffset).toBe(data.byteOffset);
});

test('date', () => {
	const data = new Date();
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.setFullYear(2000);

	expect(data.getFullYear()).not.toBe(cloned.getFullYear());
});

test('function', () => {
	const data = () => {};
	const cloned = clone(data);

	expect(cloned).toBe(undefined);
});

test('instance', () => {
	const original = new Test(1, 'Hello');

	let cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(Test);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(Test);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('clone');

	clone.register(Test, 'custom');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(Test);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('custom');

	clone.register(Test, value => new Test(value.id, 'callback'));

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(Test);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('callback');

	clone.unregister(Test);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(Test, 'nonExistentMethod');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.unregister(Test);

	clone.register(Test, clone);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(Test, 123 as never);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(123 as never, 'custom');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.unregister(123 as never);
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

test('node', () => {
	const data = document.createElement('div');
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.textContent = 'A node';

	expect(data.textContent).toBe('');
});

test('primitive', () => {
	const primitives = [null, undefined, true, 1, BigInt(1), 'foo'];

	const replacements = [undefined, null, false, 2, BigInt(2), 'bar'];

	for (const data of primitives) {
		const index = primitives.indexOf(data);

		let cloned = clone(data);

		expect(cloned).toBe(data);

		cloned = replacements[index];

		expect(cloned).not.toBe(data);
	}
});

test('regular expression', () => {
	const data = /test/;
	const cloned = clone(data);

	expect(cloned).not.toBe(data);
});

test('set', () => {
	const data = new Set([1, 2, 3]);
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.add(4);

	expect(data.has(4)).toBe(false);
});

test('symbol', () => {
	const data = Symbol('abc');
	const cloned = clone(data);

	expect(cloned).not.toBe(data);
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

test('depth', () => {
	const values = [
		[1, 2, 3],
		{a: 1, b: 2},
		new ArrayBuffer(8),
		new DataView(new ArrayBuffer(8)),
		new Map([
			['a', 1],
			['b', 2],
		]),
		document.createElement('div'),
		/test/,
		new Set([1, 2, 3]),
		new Int8Array([1, 2, 3]),
		new WeakMap(),
		new WeakSet(),
	];

	for (const value of values) {
		const index = values.indexOf(value);

		const data: PlainObject = {};
		const parts: number[] = [];

		let current = data;

		for (let index = 0; index < 100; index += 1) {
			parts.push(index);

			if (index === 99) {
				current[index] = value;

				current = current[index] as PlainObject;
			} else {
				current = current[index] = {};
			}
		}

		const cloned = clone(data);

		const key = parts.join('.');

		const last = getValue(cloned, key) as PlainObject;

		if (index < 2) {
			expect(last).toEqual(value);
		} else {
			expect(last).toBe(value);
		}
	}
});

test('references', () => {
	const values = [
		[1, 2, 3],
		{a: 1, b: 2},
		new ArrayBuffer(8),
		new DataView(new ArrayBuffer(8)),
		new Map([
			['a', 1],
			['b', 2],
		]),
		document.createElement('div'),
		/test/,
		new Set([1, 2, 3]),
		new Int8Array([1, 2, 3]),
		new WeakMap(),
		new WeakSet(),
	];

	for (const value of values) {
		const index = values.indexOf(value);

		const data = {
			value,
			nested: {
				value,
			},
		};

		const cloned = clone(data);

		expect(cloned).not.toBe(data);

		if (values.length - index < 3) {
			expect(cloned.value).toBe(data.value);
			expect(cloned.nested.value).toBe(data.nested.value);
		} else {
			expect(cloned.value).not.toBe(data.value);
			expect(cloned.nested.value).not.toBe(data.nested.value);
		}

		expect(cloned.value).toEqual(data.value);
		expect(cloned.nested.value).toEqual(data.nested.value);

		expect(cloned.value).toBe(cloned.nested.value);
	}
});
