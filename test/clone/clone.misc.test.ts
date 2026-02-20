import {expect, test} from 'vitest';
import {clone, getValue, type PlainObject} from '../../src/value';

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

test('symbol', () => {
	const data = Symbol('abc');
	const cloned = clone(data);

	expect(cloned).not.toBe(data);
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
