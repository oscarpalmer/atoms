import {expect, test} from 'vitest';
import {copy} from '../../src';
import {TestCloneItem} from '../.fixtures/clone.fixture';

test('copy', () => {
	const primitives = [
		null,
		undefined,
		true,
		123,
		123n,
		'Hello, world!',
		Symbol('Hello, world!'),
		() => {},
	];

	for (const primitive of primitives) {
		expect(copy(primitive)).toBe(primitive);
	}

	const objects = [
		[1, 2, 3],
		{a: 1, b: 2, c: 3},
		new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		]),
		new Set([1, 2, 3]),
	];

	for (const object of objects) {
		const copied = copy(object);

		expect(copied).not.toBe(object);
		expect(copied).toEqual(object);
	}

	const nested = {
		array: [1, 2, 3],
		arrayBuffer: new ArrayBuffer(8),
		dataView: new DataView(new ArrayBuffer(8)),
		item: new TestCloneItem(123, 'Hello'),
		map: new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		]),
		node: document.createElement('div'),
		object: {a: 1, b: 2, c: 3},
		set: new Set([1, 2, 3]),
		typedArray: new Uint8Array([1, 2, 3]),
	};

	const copied = copy(nested);

	expect(copied).not.toBe(nested);
	expect(copied).toEqual(nested);

	expect(copied.array).toBe(nested.array);
	expect(copied.arrayBuffer).toBe(nested.arrayBuffer);
	expect(copied.dataView).toBe(nested.dataView);
	expect(copied.item).toBe(nested.item);
	expect(copied.map).toBe(nested.map);
	expect(copied.node).toBe(nested.node);
	expect(copied.object).toBe(nested.object);
	expect(copied.set).toBe(nested.set);
	expect(copied.typedArray).toBe(nested.typedArray);

	const date = new Date();

	expect(copy(date)).not.toBe(date);
	expect(copy(date).getTime()).toBe(date.getTime());

	const reg = new RegExp('xyz', 'g');

	expect(copy(reg)).toBe(reg);
});
