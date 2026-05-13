import {expect, test} from 'vitest';
import {clone, copy} from '../../src';

test('clone: shallow', () => {
	const array = [1, 2, 3];

	expect(clone(array, true)).not.toBe(array);

	const obj = {
		message: 'Hello, world!',
	};

	expect(clone(obj, true)).not.toBe(obj);

	const objects = [obj];

	expect(clone(objects, true)).not.toBe(objects);
	expect(clone(objects, true)[0]).toBe(obj);

	const map = new Map([['key', obj]]);

	expect(clone(map, true)).not.toBe(map);
	expect(clone(map, true).get('key')).toBe(obj);

	const set = new Set([obj]);

	expect(clone(set, true)).not.toBe(set);
	expect(clone(set, true).has(obj)).toBe(true);
});

test('copy', () => {
	const values = [null, undefined, true, 123, 'Hello, world!'];

	for (const value of values) {
		expect(copy(value)).toBe(value);
	}

	const sym = Symbol('Hello, world!');
	const reg = new RegExp('xyz', 'g');

	expect(copy(sym)).not.toBe(sym);
	expect(copy(sym).description).toBe(sym.description);

	expect(copy(reg)).not.toBe(reg);
	expect(copy(reg).source).toBe(reg.source);
	expect(copy(reg).flags).toBe(reg.flags);
});
