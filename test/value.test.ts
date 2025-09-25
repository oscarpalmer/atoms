import {expect, test} from 'vitest';
import type {NestedPartial} from '../src/models';
import {
	compare,
	diff,
	getValue,
	merge,
	partial,
	setValue,
	smush,
	unsmush,
} from '../src/value';

type Diffable = {
	numbers: number[];
	object: {
		nested: {
			[key: string]: unknown;
		};
	};
	strings: string[];
	value: unknown;
};

type DiffableExtended = {
	additional: unknown;
} & Diffable;

type Mergeable = {
	age: number;
	cars: string[];
	hobbies: string[];
	name: {first: string; last: string};
	profession: string;
};

test('compare', () => {
	expect(compare(null, null)).toBe(0);
	expect(compare(null, 123)).toBe(-1);
	expect(compare(123, null)).toBe(1);
	expect(compare(123, 123)).toBe(0);

	expect(compare(0n, 0n)).toBe(0);
	expect(compare(0n, 1n)).toBe(-1);
	expect(compare(1n, 0n)).toBe(1);

	expect(compare(false, false)).toBe(0);
	expect(compare(false, true)).toBe(-1);
	expect(compare(true, false)).toBe(1);

	expect(compare(0, 0)).toBe(0);
	expect(compare(0, 1)).toBe(-1);
	expect(compare(1, 0)).toBe(1);

	expect(compare('a', 'a')).toBe(0);
	expect(compare('a', 'b')).toBe(-1);
	expect(compare('b', 'a')).toBe(1);

	expect(compare(Symbol('a'), Symbol('a'))).toBe(0);
	expect(compare(Symbol.for('a'), Symbol.for('a'))).toBe(0);
	expect(compare(Symbol('a'), Symbol('b'))).toBe(-1);
	expect(compare(Symbol('b'), Symbol('a'))).toBe(1);
	expect(compare(Symbol(), Symbol())).toBe(0);

	expect(compare(new Date('2000-01-01'), new Date('2000-01-01'))).toBe(0);
	expect(compare(new Date('2000-01-01'), new Date('2000-01-02'))).toBe(-1);
	expect(compare(new Date('2000-01-02'), new Date('2000-01-01'))).toBe(1);

	expect(compare({}, {})).toBe(0);
	expect(compare({a: 1}, {a: 1})).toBe(0);
	expect(compare({a: 1}, {a: 2})).toBe(-1);
	expect(compare({a: 2}, {a: 1})).toBe(1);

	expect(compare(1, 'a')).toBe(-1);
	expect(compare('a', 1)).toBe(1);

	expect(compare('a', 'a')).toBe(0);
	expect(compare('a', 'b')).toBe(-1);
	expect(compare('b', 'a')).toBe(1);

	expect(compare('a b c 1 2 3', 'a b c 1 2 3')).toBe(0);
	expect(compare('a b c 1 2 3', 'a b c 1 2 4')).toBe(-1);
	expect(compare('a b c 1 2 4', 'a b c 1 2 3')).toBe(1);

	expect(compare(['a', null], ['a', 'b'])).toBe(-1);
	expect(compare(['a', ''], ['a', 'b'])).toBe(-1);
	expect(compare(['a', 'b'], ['a', ''])).toBe(1);
	expect(compare(['a', 'b', 'c'], ['a', Symbol('b'), 'd'])).toBe(-1);

	expect(compare(['a', 1], ['a', '1'])).toBe(0);
	expect(compare(['a', 1], ['a', 2])).toBe(-1);
	expect(compare(['a', 2], ['a', 1])).toBe(1);

	expect(compare(['a', 1], ['b', 1])).toBe(-1);
	expect(compare(['b', 1], ['a', 1])).toBe(1);

	expect(compare(['a', 1], ['a', 'x'])).toBe(-1);
	expect(compare(['a', 'x'], ['a', 1])).toBe(1);

	expect(compare(['a', 'NaN'], ['a', 'NaN'])).toBe(0);
});

test('diff', () => {
	expect(diff(null, null).type).toBe('none');
	expect(diff(undefined, undefined).type).toBe('none');

	expect(diff(null, undefined).type).toBe('full');
	expect(diff(null, undefined, {relaxedNullish: true}).type).toBe('none');

	expect(diff(1, 1).type).toBe('none');
	expect(diff(1, 2).type).toBe('full');

	expect(diff('a', 'a').type).toBe('none');
	expect(diff('a', 'b').type).toBe('full');

	expect(diff([1, 2, 3], undefined).type).toBe('full');
	expect(diff([1, 2, 3], [3, 2, 1]).type).toBe('partial');
	expect(diff([1, 2, 3], [1, 2, 3]).type).toBe('none');

	const first: Diffable = {
		numbers: Array.from({length: 10}).map((_, i) => i),
		object: {
			nested: {
				a: 1,
				b: 2,
				c: 3,
			},
		},
		strings: Array.from({length: 10}).map((_, i) => String(i)),
		value: 123,
	};

	const second: DiffableExtended = {
		additional: 'xyz',
		numbers: Array.from({length: 10}).map((_, i) => (i % 3 === 0 ? -1 : i)),
		object: {
			nested: {
				a: 3,
				b: 2,
				c: 1,
			},
		},
		strings: Array.from({length: 10}).map((_, i) =>
			String(i % 3 === 0 ? -1 : i),
		),
		value: 456,
	};

	const diffed = diff(first, second);

	expect(diffed.type).toBe('partial');
	expect(Object.keys(diffed.values).length).toBe(16);

	expect(diffed.values.numbers).toEqual({
		from: first.numbers,
		to: second.numbers,
	});

	expect(diffed.values.object).toEqual({from: first.object, to: second.object});

	expect(diffed.values['object.nested']).toEqual({
		from: first.object.nested,
		to: second.object.nested,
	});

	expect(diffed.values.strings).toEqual({
		from: first.strings,
		to: second.strings,
	});

	expect(diffed.values['numbers.0']).toEqual({from: 0, to: -1});
	expect(diffed.values['numbers.3']).toEqual({from: 3, to: -1});
	expect(diffed.values['numbers.6']).toEqual({from: 6, to: -1});
	expect(diffed.values['numbers.9']).toEqual({from: 9, to: -1});

	expect(diffed.values['strings.0']).toEqual({from: '0', to: '-1'});
	expect(diffed.values['strings.3']).toEqual({from: '3', to: '-1'});
	expect(diffed.values['strings.6']).toEqual({from: '6', to: '-1'});
	expect(diffed.values['strings.9']).toEqual({from: '9', to: '-1'});

	expect(diffed.values.value).toEqual({from: 123, to: 456});
	expect(diffed.values.additional).toEqual({from: undefined, to: 'xyz'});

	let arrays = diff([1, 2, 3], [1, 2, 3, 4, 5]);

	expect(arrays.type).toBe('partial');

	expect(arrays.values).toEqual({
		'3': {from: undefined, to: 4},
		'4': {from: undefined, to: 5},
	});

	arrays = diff([1, 2, 3, 4, 5], [1, 2, 3]);

	expect(arrays.type).toBe('partial');

	expect(arrays.values).toEqual({
		'3': {from: 4, to: undefined},
		'4': {from: 5, to: undefined},
	});

	let nullish = diff({
		a: {
			b: {
				c: 123,
			},
		},
		nullish: null,
	}, {
		a: {
			x: 'y',
		},
		nullish: undefined,
	});

	expect(nullish.type).toBe('partial');

	expect(nullish.values['a.b.c']).toEqual({from: 123, to: undefined});
	expect(nullish.values['a.x']).toEqual({from: undefined, to: 'y'});
	expect(nullish.values.nullish).toEqual({from: null, to: undefined});

	nullish = diff({
		a: {
			b: {
				c: 123,
			},
		},
		nullish: null,
	}, {
		a: {
			x: 'y',
		},
		nullish: undefined,
	}, {
		relaxedNullish: true,
	});

	expect(nullish.type).toBe('partial');
	expect(nullish.values.relaxedNull).toBeUndefined();
});

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

test('merge', () => {
	const first: NestedPartial<Mergeable> = {
		age: 99,
		cars: ['Alfa Romeo Spider', 'Lamborghini Miura'],
		hobbies: ['Gaming', 'Reading'],
		name: {
			first: 'Oscar',
		},
		profession: 'Developer?',
	};

	const second: NestedPartial<Mergeable> = {
		cars: undefined,
		name: {
			last: 'Palmér',
		},
	};

	const third: NestedPartial<Mergeable> = {
		cars: ['Toyota 2000GT'],
	};

	const fourth: NestedPartial<Mergeable> = {
		cars: ['Ferrari 250 GT California'],
		hobbies: ['Wrestling'],
	};

	const merged = merge([first, second, third, fourth], {
		replaceableObjects: 'cars',
	});

	expect(merged).toEqual({
		age: 99,
		cars: ['Ferrari 250 GT California'],
		hobbies: ['Wrestling', 'Reading'],
		name: {
			first: 'Oscar',
			last: 'Palmér',
		},
		profession: 'Developer?',
	});

	expect(merge([])).toEqual({});
	expect(merge([{hello: 'world'}])).toEqual({hello: 'world'});

	expect(
		merge([[1, 2, 3, 4, 5], [null, null, 99] as never], {
			skipNullableInArrays: true,
		}),
	).toEqual([1, 2, 99, 4, 5]);

	const replaceableFirst = {
		a: {
			b: {
				c: {
					d: [1, 2, 3],
					d2: ['x', 'y', 'z'],
				},
				c9x: {msg: '!', value: 99},
			},
			b2: ['a', 'b', 'c'],
			bx: {value: '?'},
		},
	};

	const replaceableSecond = {
		a: {
			b: {
				c: {
					d: [4, 5, 6],
					d2: ['å', 'ä', 'ö'],
				},
				c9x: {msg: '!!!'},
			},
			b2: ['d', 'e', 'f'],
		},
	};

	const replaceableMerged = merge([replaceableFirst, replaceableSecond], {
		replaceableObjects: ['d', /c9x/, /\w\d$/],
	});

	expect(replaceableMerged).toEqual({
		a: {
			b: {
				c: {
					d: [4, 5, 6],
					d2: ['å', 'ä', 'ö'],
				},
				c9x: {msg: '!!!'},
			},
			b2: ['d', 'e', 'f'],
			bx: {value: '?'},
		},
	});

	expect(merge('blah' as never)).toEqual({});
	expect(merge(['blah' as never])).toEqual({});
});

test('partial', () => {
	expect(
		partial(
			{
				a: 1,
				b: true,
				c: 'abc',
			},
			['b'],
		),
	).toEqual({
		b: true,
	});

	expect(partial('blah' as never, [])).toEqual({});
	expect(partial({}, 'blah' as never)).toEqual({});
	expect(partial({}, [])).toEqual({});
	expect(partial({a: 1}, [])).toEqual({});
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
	};

	expect(setValue(data, '', undefined)).toBe(data);

	setValue(data, 'in.a.NeStEd.array.3', 123, true);
	setValue(data, 'in.a.nested.map.3', 123);
	setValue(data, 'in.a.NeStEd.object.3', 123, true);
	setValue(data, 'in.a.nested.set.3', 123);
	setValue(data, 'in.a.nEw.array.5', 123);

	expect(data.in.a.nested.array[3]).toEqual(123);
	expect(data.in.a.nested.map.get('3')).toEqual(undefined);
	expect((data.in.a.nested.object as never)['3']).toEqual(123);

	setValue(data, 'change.hmm.huh', 123);

	// @ts-expect-error - Testing created objects
	expect(data.change.hmm.huh).toEqual(123);

	setValue(data, 'change.hmm.0.id', 123);

	// @ts-expect-error - Testing created arrays
	expect(data.change.hmm[0].id).toEqual(123);

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
