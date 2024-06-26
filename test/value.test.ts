import {expect, test} from 'bun:test';
import {diff, getValue, merge, setValue} from '../src/js';

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
	age?: number;
	hobbies?: string[];
	name?: {first?: string; last?: string};
	profession?: string;
};

test('diff', () => {
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
		numbers: Array.from({length: 10}).map((_, i) => i % 3 === 0 ? -1 : i),
		object: {
			nested: {
				a: 3,
				b: 2,
				c: 1,
			},
		},
		strings: Array.from({length: 10}).map((_, i) => String(i % 3 === 0 ? -1 : i)),
		value: 456,
	};

	const diffed = diff(first, second);

	expect(diffed.type).toBe('partial');
	expect(Object.keys(diffed.values).length).toBe(16);

	expect(diffed.values.numbers).toEqual({from: first.numbers, to: second.numbers});
	expect(diffed.values.object).toEqual({from: first.object, to: second.object});
	expect(diffed.values['object.nested']).toEqual({from: first.object.nested, to: second.object.nested});
	expect(diffed.values.strings).toEqual({from: first.strings, to: second.strings});

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
	const first: Mergeable = {
		age: 99,
		hobbies: ['Gaming', 'Reading'],
		name: {
			first: 'Oscar',
		},
		profession: 'Developer?',
	};

	const second: Mergeable = {
		name: {
			last: 'Palmér',
		},
	};

	const third: Mergeable = {
		hobbies: ['Wrestling'],
	};

	const merged = merge(first, second, third);

	expect(merged).toEqual({
		age: 99,
		hobbies: ['Wrestling', 'Reading'],
		name: {
			first: 'Oscar',
			last: 'Palmér',
		},
		profession: 'Developer?',
	});

	expect(merge()).toEqual({});
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
	expect(data.in.a.nested.object['3']).toEqual(123);

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
