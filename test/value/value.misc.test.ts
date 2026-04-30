import {expect, test} from 'vitest';
import {freeze, omit, pick, shake, smush, transform, unsmush} from '../../src';

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
	});

	expect(frozen.a).toBe(123);
	expect(frozen.b.c).toBe('abc');
	expect(frozen.d).toEqual([1, 2, 3]);
	expect(frozen.e()).toBe('def');

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

test('omit', () => {
	expect(
		omit(
			{
				a: 1,
				b: true,
				c: 'abc',
			},
			['b', 'd' as never],
		),
	).toEqual({
		a: 1,
		c: 'abc',
	});

	expect(omit('blah' as never, [])).toEqual({});
	expect(omit({}, 'blah' as never)).toEqual({});
	expect(omit({}, [])).toEqual({});
	expect(omit({a: 1}, [])).toEqual({a: 1});
});

test('pick', () => {
	expect(
		pick(
			{
				a: 1,
				b: true,
				c: 'abc',
			},
			['b', 'd' as never],
		),
	).toEqual({
		b: true,
	});

	expect(pick('blah' as never, [])).toEqual({});
	expect(pick({}, 'blah' as never)).toEqual({});
	expect(pick({}, [])).toEqual({});
	expect(pick({a: 1}, [])).toEqual({});
});

test('shake', () => {
	expect(
		shake({
			a: 123,
			b: 'abc',
			c: undefined,
			d: null,
			e: false,
			f: 0,
		}),
	).toEqual({
		a: 123,
		b: 'abc',
		d: null,
		e: false,
		f: 0,
	});

	expect(shake({})).toEqual({});
	expect(shake('blah' as never)).toEqual({});
});

test('smush & unsmush', () => {
	const data = {
		a: 1,
		b: [2, 3],
		c: [
			[4, 5],
			[6, 7],
		],
		d: {
			e: 'f',
			g: {
				h: 'i',
			},
		},
	};

	const smushed = smush(data);
	const unsmushed = unsmush(smushed);

	expect(smushed['d.g.h']).toBe(data.d.g.h);
	expect(data).toEqual(unsmushed);

	const item = {
		will: {
			be: {
				reused: true,
			},
		},
	};

	const value = {
		...item,
		nested: {
			item,
		},
	};

	const smushedItem = smush(value);

	expect(smushedItem['will.be.reused']).toBe(true);
	expect(smushedItem['nested.item.will']).toEqual(item.will);

	const depth = {};
	const parts: number[] = [];

	let current = depth;

	for (let index = 0; index < 101; index += 1) {
		parts.push(index);

		(current as unknown[])[index] =
			index === 100
				? {
						message: 'Max depth reached',
					}
				: {};

		current = (current as unknown[])[index] as never;
	}

	const smushedDepth = smush(depth);
	const smushedKey = parts.slice(0, -1).join('.');

	expect((smushedDepth as never)[smushedKey]).toEqual({
		'100': {
			message: 'Max depth reached',
		},
	});

	expect(smush('blah' as never)).toEqual({});
	expect(unsmush('blah' as never)).toEqual({});
});

test('transform', () => {
	const withFn = transform(
		{
			a: 123,
			b: 'abc',
			c: true,
			d: [1, 2, 3],
		},
		(key, value) => {
			switch (key) {
				case 'a':
					return (value as number) + 1;

				case 'b':
					return (value as string).toUpperCase();

				case 'c':
					return !(value as boolean);

				default:
					return value;
			}
		},
	);

	expect(withFn).toEqual({
		a: 124,
		b: 'ABC',
		c: false,
		d: [1, 2, 3],
	});

	const withObj = transform(
		{
			a: 123,
			b: 'abc',
			c: true,
			d: [1, 2, 3],
		},
		{
			a(value) {
				return value + 1;
			},
			b(value) {
				return value.toUpperCase();
			},
			c(value) {
				return !value;
			},
		},
	);

	expect(withObj).toEqual({
		a: 124,
		b: 'ABC',
		c: false,
		d: [1, 2, 3],
	});

	expect(
		transform.initialize(() => 'blah' as never)({
			a: 123,
			b: 'abc',
			c: true,
			d: [1, 2, 3],
		}),
	).toEqual({
		a: 'blah',
		b: 'blah',
		c: 'blah',
		d: 'blah',
	});

	expect(transform('blah' as never, () => 'xyz' as never)).toEqual({});
	expect(transform({a: 123}, 'blah' as never)).toEqual({a: 123});
	expect(transform({a: 123}, {a: 'blah' as never})).toEqual({a: 123});
});
