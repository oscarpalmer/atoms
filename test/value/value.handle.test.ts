import {expect, test} from 'vitest';
import {getValue, hasValue, setValue} from '../../src';
import {valueFixture} from '../.fixtures/value.fixture';

const {nested} = valueFixture;

test('getValue', () => {
	expect(getValue(nested, 'a.c.d')).toBe(nested.a.c.d);

	expect(getValue(nested, '')).toBe(undefined);
	expect(getValue(nested, 'a.B.1.C.1', true)).toBe(undefined);
	expect(getValue(nested, 'a.b.99.c')).toBe(undefined);
	expect(getValue(nested, 'a.c.d.e')).toBe(undefined);

	expect(getValue(nested, '__proto__')).toBe(undefined);
	expect(getValue(nested, 'constructor')).toBe(undefined);
	expect(getValue(nested, 'prototype')).toBe(undefined);
});

test('hasValue', () => {
	expect(hasValue(nested, 'a.c.d')).toBe(true);
	expect(hasValue(nested, 'a.C.d', true)).toBe(true);
	expect(hasValue(nested, 'a.C.d', false)).toBe(false);
	expect(hasValue(nested, 'a.C.d', 'blah' as never)).toBe(false);

	expect(hasValue(nested, '')).toBe(false);
	expect(hasValue(nested, 'a.B.1.C.1', true)).toBe(false);
	expect(hasValue(nested, 'a.b.99.c')).toBe(false);

	expect(hasValue(nested, '__proto__')).toBe(false);
	expect(hasValue(nested, 'constructor')).toBe(false);
	expect(hasValue(nested, 'prototype')).toBe(false);

	expect(hasValue.get(nested, 'a.c.d')).toEqual({ok: true, value: 123});

	expect(hasValue.get(nested, '')).toEqual({ok: false, error: 'Expected path to be a string'});

	expect(hasValue.get(nested, 'a.B.1.C.1', true)).toEqual({
		ok: false,
		error: 'Expected property to exist in object',
	});

	expect(hasValue.get(nested, 'a.b.99.c')).toEqual({
		ok: false,
		error: 'Expected property to exist in object',
	});

	expect(hasValue.get(nested, '__proto__')).toEqual({
		ok: false,
		error: 'Access to this property is not allowed',
	});

	expect(hasValue.get(nested, 'constructor')).toEqual({
		ok: false,
		error: 'Access to this property is not allowed',
	});

	expect(hasValue.get(nested, 'prototype')).toEqual({
		ok: false,
		error: 'Access to this property is not allowed',
	});

	expect(hasValue.get('blah' as never, 'a.b.c.d')).toEqual({
		ok: false,
		error: 'Expected data to be an object',
	});
});

test('setValue', () => {
	expect(setValue(nested, '', undefined)).toBe(nested);
	expect(nested.update).toBe(0);

	setValue(nested, 'update', current => current + 1);
	setValue(nested, 'in.a.NeStEd.array.3', 123, true);
	setValue(nested, 'in.a.nested.map.3', 123);
	setValue(nested, 'in.a.NeStEd.object.3', 123, true);
	setValue(nested, 'in.a.nested.set.3', 123);
	setValue(nested, 'in.a.nEw.array.5', 123);

	expect(nested.update).toBe(1);
	expect(nested.in.a.nested.array[3]).toEqual(123);
	expect(nested.in.a.nested.map.get('3')).toEqual(undefined);
	expect((nested.in.a.nested.object as never)['3']).toEqual(123);

	setValue(nested, 'change.hmm.huh', 123);
	setValue(nested, 'update', current => current * 5);

	// @ts-expect-error - Testing created objects
	expect(nested.change.hmm.huh).toEqual(123);
	expect(nested.update).toBe(5);

	setValue(nested, 'change.hmm.0.id', 123);
	setValue(nested, 'update', current => current ** 2);

	// @ts-expect-error - Testing created arrays
	expect(nested.change.hmm[0].id).toEqual(123);
	expect(nested.update).toBe(25);

	expect(nested.in.a.nested.set.has(123)).toBe(false);

	let setArray = Array.from(nested.in.a.nested.set);

	expect(setArray.length).toBe(0);
	expect(setArray[0]).toEqual(undefined);

	setValue(nested, 'in.a.nested.set.0', 456);

	expect(nested.in.a.nested.set.has(123)).toBe(false);
	expect(nested.in.a.nested.set.has(456)).toBe(false);

	setArray = Array.from(nested.in.a.nested.set);

	expect(setArray.length).toBe(0);
	expect(setArray[0]).toEqual(undefined);

	// @ts-expect-error - Testing created objects
	expect(nested.in.a.nEw.array[5]).toEqual(123);

	setValue(nested, '__proto__', 123);
	setValue(nested, 'constructor', 123);
	setValue(nested, 'prototype', 123);

	expect(nested.constructor).toBe(nested.constructor);

	// @ts-expect-error - Testing JS internals
	expect(nested.__proto__).toBe(nested.__proto__);
	// @ts-expect-error - Testing JS internals
	expect(nested.prototype).toBe(nested.prototype);
});
