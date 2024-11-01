import {expect, test} from 'vitest';
import {clone} from '../src/value';

class Test {
	constructor(
		readonly id: number,
		public name: string,
	) {}
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
	const data = new Test(1, 'Hello');
	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.name = 'Hi';

	expect(data.name).not.toBe(cloned.name);
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
