import {expect, test} from 'vitest';
import {getValue, setValue} from '../../src';

test('getValue', () => {
	const data = {
		a: {
			b: [{}, new Map([['c', new Set([null, 123])]]), {}],
			c: {
				d: 123,
			},
		},
	};

	expect(getValue(data, 'a.c.d')).toBe(data.a.c.d);

	expect(getValue(data, '')).toBe(undefined);
	expect(getValue(data, 'a.B.1.C.1', true)).toBe(undefined);
	expect(getValue(data, 'a.b.99.c')).toBe(undefined);

	expect(getValue(data, '__proto__')).toBe(undefined);
	expect(getValue(data, 'constructor')).toBe(undefined);
	expect(getValue(data, 'prototype')).toBe(undefined);
});

test('setValue', () => {
	const data = {
		change: {},
		in: {
			a: {
				nested: {
					array: [],
					map: new Map(),
					object: {},
					set: new Set(),
				},
			},
		},
		update: 0,
	};

	expect(setValue(data, '', undefined)).toBe(data);
	expect(data.update).toBe(0);

	setValue(data, 'update', current => current + 1);
	setValue(data, 'in.a.NeStEd.array.3', 123, true);
	setValue(data, 'in.a.nested.map.3', 123);
	setValue(data, 'in.a.NeStEd.object.3', 123, true);
	setValue(data, 'in.a.nested.set.3', 123);
	setValue(data, 'in.a.nEw.array.5', 123);

	expect(data.update).toBe(1);
	expect(data.in.a.nested.array[3]).toEqual(123);
	expect(data.in.a.nested.map.get('3')).toEqual(undefined);
	expect((data.in.a.nested.object as never)['3']).toEqual(123);

	setValue(data, 'change.hmm.huh', 123);
	setValue(data, 'update', current => current * 5);

	// @ts-expect-error - Testing created objects
	expect(data.change.hmm.huh).toEqual(123);
	expect(data.update).toBe(5);

	setValue(data, 'change.hmm.0.id', 123);
	setValue(data, 'update', current => current ** 2);

	// @ts-expect-error - Testing created arrays
	expect(data.change.hmm[0].id).toEqual(123);
	expect(data.update).toBe(25);

	expect(data.in.a.nested.set.has(123)).toBe(false);

	let setArray = Array.from(data.in.a.nested.set);

	expect(setArray.length).toBe(0);
	expect(setArray[0]).toEqual(undefined);

	setValue(data, 'in.a.nested.set.0', 456);

	expect(data.in.a.nested.set.has(123)).toBe(false);
	expect(data.in.a.nested.set.has(456)).toBe(false);

	setArray = Array.from(data.in.a.nested.set);

	expect(setArray.length).toBe(0);
	expect(setArray[0]).toEqual(undefined);

	// @ts-expect-error - Testing created objects
	expect(data.in.a.nEw.array[5]).toEqual(123);

	setValue(data, '__proto__', 123);
	setValue(data, 'constructor', 123);
	setValue(data, 'prototype', 123);

	expect(data.constructor).toBe(data.constructor);

	// @ts-expect-error - Testing JS internals
	expect(data.__proto__).toBe(data.__proto__);
	// @ts-expect-error - Testing JS internals
	expect(data.prototype).toBe(data.prototype);
});
