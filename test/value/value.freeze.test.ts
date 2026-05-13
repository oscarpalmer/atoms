import {expect, test} from 'vitest';
import {freeze, flatFreeze, isFrozen} from '../../src/value/freeze';

test('freeze', () => {
	const ref = {
		message: 'Hello, world!',
	};

	const frozen = freeze({
		a: 123,
		b: {
			c: 'abc',
		},
		d: [1, 2, 3],
		e: function () {
			return 'def';
		},
		g: {
			ref,
		},
		h: [ref],
		ref,
		map: new Map([[1, ref]]),
		set: new Set([ref]),
	});

	expect(frozen.a).toBe(123);
	expect(frozen.b.c).toBe('abc');
	expect(frozen.d).toEqual([1, 2, 3]);
	expect(frozen.e()).toBe('def');
	expect(frozen.map.get(1)).toBe(ref);
	expect(frozen.set.has(ref)).toBe(true);

	expect(() => {
		// @ts-expect-error: Testing that the frozen value cannot be modified
		frozen.a = 456;
	}).toThrow();

	expect(() => {
		// @ts-expect-error: Testing that the frozen value cannot be modified
		frozen.b.c = 'def';
	}).toThrow();

	expect(() => {
		// @ts-expect-error: Testing that the frozen value cannot be modified
		frozen.d.push(4);
	}).toThrow();

	expect(() => {
		// @ts-expect-error: Testing that the frozen value cannot be modified
		frozen.e = function () {
			return 'ghi';
		};
	}).toThrow();

	expect(frozen.a).toBe(123);
	expect(frozen.b.c).toBe('abc');
	expect(frozen.d).toEqual([1, 2, 3]);
	expect(frozen.e()).toBe('def');

	expect(frozen.g.ref).toBe(ref);
	expect(frozen.h[0]).toBe(ref);
	expect(frozen.ref).toBe(ref);

	expect(freeze('blah')).toBe('blah');

	// Would throw with `Object.freeze`
	expect(() => freeze(new Uint8Array(1))).not.toThrow();
});

test('freeze: flat', () => {
	const fns = [flatFreeze, freeze.flat];

	for (const fn of fns) {
		const arr = fn([1, 2, 3]);

		expect(arr).toEqual([1, 2, 3]);

		try {
			// @ts-expect-error: Testing that the frozen value cannot be modified
			arr[1] = 99;
		} catch (error) {
			expect(error).toBeInstanceOf(TypeError);
		}
	}

	const obj = freeze(
		{
			a: 123,
			b: {
				c: 'abc',
			},
			d: [1, 2, 3],
		},
		true,
	);

	expect(obj.a).toBe(123);
	expect(obj.b.c).toBe('abc');
	expect(obj.d).toEqual([1, 2, 3]);

	try {
		// @ts-expect-error: Testing that the frozen value cannot be modified
		obj.a = 456;
	} catch (error) {
		expect(error).toBeInstanceOf(TypeError);
	}

	try {
		// @ts-expect-error: Testing that the frozen value cannot be modified
		obj[1] = 99;
	} catch (error) {
		expect(error).toBeInstanceOf(TypeError);
	}

	obj.b.c = 'def';

	expect(obj.a).toBe(123);
	expect(obj.b.c).toBe('def');
	expect(obj.d).toEqual([1, 2, 3]);

	const map = flatFreeze(new Map([['key', 'value']]));
	const set = freeze.flat(new Set([1, 2, 3]));

	expect(map).toEqual(new Map([['key', 'value']]));
	expect(set).toEqual(new Set([1, 2, 3]));

	// @ts-expect-error: Testing that the frozen value cannot be modified
	map.delete('key');
	// @ts-expect-error: Testing that the frozen value cannot be modified
	set.delete(1);

	expect(map).toEqual(new Map([['key', 'value']]));
	expect(set).toEqual(new Set([1, 2, 3]));
});

test('freeze.is', () => {
	const values = [
		null,
		undefined,
		true,
		123,
		123n,
		'abc',
		() => {},
		{},
		{a: 1},
		[],
		[1, 2, 3],
		new Map(),
		new Set(),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		expect(isFrozen(value)).toBe(false);
		expect(freeze.is(value)).toBe(false);

		freeze(value);

		expect(isFrozen(value)).toBe(index >= 7);
		expect(freeze.is(value)).toBe(index >= 7);
	}
});

test('freeze: Map & Set', () => {
	const ref = {
		message: 'Hello, universe!',
	};

	const frozenMap = freeze(
		new Map([
			[1, ref],
			[2, ref],
			[3, ref],
		]),
	);
	const frozenSet = freeze(new Set([ref, ref, ref]));

	expect(frozenMap).toEqual(
		new Map([
			[1, ref],
			[2, ref],
			[3, ref],
		]),
	);
	expect(frozenSet).toEqual(new Set([ref, ref, ref]));

	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenMap.set(1, ref);
	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenMap.set(2, ref);
	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenSet.add(ref);

	expect(frozenMap).toEqual(
		new Map([
			[1, ref],
			[2, ref],
			[3, ref],
		]),
	);
	expect(frozenSet).toEqual(new Set([ref, ref, ref]));

	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenMap.delete(1);
	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenSet.delete(ref);

	expect(frozenMap).toEqual(
		new Map([
			[1, ref],
			[2, ref],
			[3, ref],
		]),
	);
	expect(frozenSet).toEqual(new Set([ref, ref, ref]));

	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenMap.clear();
	// @ts-expect-error: Testing that the frozen value cannot be modified
	frozenSet.clear();

	expect(frozenMap).toEqual(
		new Map([
			[1, ref],
			[2, ref],
			[3, ref],
		]),
	);
	expect(frozenSet).toEqual(new Set([ref, ref, ref]));
});
