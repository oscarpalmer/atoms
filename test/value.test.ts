import {expect, test} from 'bun:test';
import {clone, diff, get, merge, set} from '../src/js/value';

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

class Test {
	constructor(
		readonly id: number,
		public name: string,
	) {}
}

test('clone', () => {
	const data = {
		array: ['a', 1, true],
		boolean: true,
		date: new Date(),
		expression: /test/,
		instances: [new Test(1, 'Hello'), new Test(2, 'World')],
		map: new Map([
			['a', 1],
			['b', 2],
		]),
		set: new Set([1, 2, 3]),
	};

	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.array.push('b');
	cloned.boolean = false;
	cloned.date.setFullYear(2000);
	cloned.instances[0].name = 'Hi';
	cloned.instances[1].name = 'Earth';
	cloned.map.set('c', 3);
	cloned.set.add(4);

	expect(data.array[3]).toBeUndefined();
	expect(data.boolean).toBe(true);
	expect(data.date.getFullYear()).not.toBe(2000);
	expect(data.instances[0].name).toBe('Hello');
	expect(data.instances[1].name).toBe('World');
	expect(data.map.get('c')).toBeUndefined();
	expect(data.set.has(4)).toBe(false);

	expect(cloned.expression).not.toBe(data.expression);
});

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

test('get', () => {
	const data = {
		a: {
			b: [{}, new Map([['c', new Set([null, 123])]]), {}],
		},
	};

	// @ts-expect-error - Testing invalid input
	expect(get(undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(get(null)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(get(data, undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(get(data, null)).toBe(undefined);

	expect(get(data, '')).toBe(undefined);
	expect(get(data, 'a.b.1.c.1')).toBe(undefined);
	expect(get(data, 'a.b.99.c')).toBe(undefined);

	expect(get(data, '__proto__')).toBe(undefined);
	expect(get(data, 'constructor')).toBe(undefined);
	expect(get(data, 'prototype')).toBe(undefined);
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
});

test('set', () => {
	const data = {
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

	// @ts-expect-error - Testing invalid input
	expect(set(undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(set(null)).toBe(null);

	// @ts-expect-error - Testing invalid input
	expect(set(data, undefined)).toBe(data);

	// @ts-expect-error - Testing invalid input
	expect(set(data, null)).toBe(data);

	expect(set(data, '', undefined)).toBe(data);

	set(data, 'in.a.nested.array.3', 123);
	set(data, 'in.a.nested.map.3', 123);
	set(data, 'in.a.nested.object.3', 123);
	set(data, 'in.a.nested.set.3', 123);
	set(data, 'in.a.new.array.5', 123);

	expect(data.in.a.nested.array[3]).toEqual(123);
	expect(data.in.a.nested.map.get('3')).toEqual(123);
	expect(data.in.a.nested.object['3']).toEqual(123);

	expect(data.in.a.nested.set.has(123)).toBe(false);

	let setArray = Array.from(data.in.a.nested.set);

	expect(setArray.length).toBe(0);
	expect(setArray[0]).toEqual(undefined);

	set(data, 'in.a.nested.set.0', 456);

	expect(data.in.a.nested.set.has(123)).toBe(false);
	expect(data.in.a.nested.set.has(456)).toBe(false);

	setArray = Array.from(data.in.a.nested.set);

	expect(setArray.length).toBe(0);
	expect(setArray[0]).toEqual(undefined);

	// @ts-expect-error - Testing created objects
	expect(data.in.a.new.array[5]).toEqual(123);

	set(data, '__proto__', 123);
	set(data, 'constructor', 123);
	set(data, 'prototype', 123);

	expect(data.constructor).toBe(data.constructor);

	// @ts-expect-error - Testing JS internals
	expect(data.__proto__).toBe(data.__proto__);
	// @ts-expect-error - Testing JS internals
	expect(data.prototype).toBe(data.prototype);
});
