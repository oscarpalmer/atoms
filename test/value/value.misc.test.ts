import {expect, test} from 'vitest';
import {omit, pick, smush, unsmush} from '../../src';

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
