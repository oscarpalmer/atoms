import {expect, test} from 'bun:test';
import {clone, diff, getValue, merge, setValue} from '../src/js/value';

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
		bigint: BigInt(123),
		boolean: true,
		date: new Date(),
		expression: /test/,
		fn() {},
		instances: [new Test(1, 'Hello'), new Test(2, 'World')],
		map: new Map([
			['a', 1],
			['b', 2],
		]),
		nil: null,
		node: document.createElement('div'),
		set: new Set([1, 2, 3]),
		symbol: Symbol('abc'),
		undef: undefined,
	};

	const cloned = clone(data);

	expect(cloned).not.toBe(data);

	cloned.array.push('b');
	cloned.bigint = BigInt(456);
	cloned.boolean = false;
	cloned.date.setFullYear(2000);
	cloned.instances[0].name = 'Hi';
	cloned.instances[1].name = 'Earth';
	cloned.map.set('c', 3);
	cloned.node.textContent = 'A node';
	cloned.set.add(4);

	expect(data.array[3]).not.toBe(cloned.array[3]);
	expect(data.bigint).not.toBe(cloned.bigint);
	expect(data.boolean).not.toBe(cloned.boolean);
	expect(data.date.getFullYear()).not.toBe(cloned.date.getFullYear());
	expect(data.expression).not.toBe(cloned.expression);
	expect(data.instances[0].name).not.toBe(cloned.instances[0].name);
	expect(data.instances[1].name).not.toBe(cloned.instances[1].name);
	expect(data.map.get('c')).not.toBe(cloned.map.get('c'));
	expect(data.node.textContent).not.toBe(cloned.node.textContent);
	expect(data.set.has(4)).not.toBe(cloned.set.has(4));
	expect(data.symbol).not.toBe(cloned.symbol);

	expect(data.fn).toBe(cloned.fn);
	expect(data.nil).toBe(cloned.nil);
	expect(data.undef).toBe(cloned.undef);
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

test('getValue', () => {
	const data = {
		a: {
			b: [{}, new Map([['c', new Set([null, 123])]]), {}],
		},
	};

	// @ts-expect-error - Testing invalid input
	expect(getValue(undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(getValue(null)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(getValue(data, undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(getValue(data, null)).toBe(undefined);

	expect(getValue(data, '')).toBe(undefined);
	expect(getValue(data, 'a.b.1.c.1')).toBe(undefined);
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
});

test('setValue', () => {
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
	expect(setValue(undefined)).toBe(undefined);

	// @ts-expect-error - Testing invalid input
	expect(setValue(null)).toBe(null);

	// @ts-expect-error - Testing invalid input
	expect(setValue(data, undefined)).toBe(data);

	// @ts-expect-error - Testing invalid input
	expect(setValue(data, null)).toBe(data);

	expect(setValue(data, '', undefined)).toBe(data);

	setValue(data, 'in.a.nested.array.3', 123);
	setValue(data, 'in.a.nested.map.3', 123);
	setValue(data, 'in.a.nested.object.3', 123);
	setValue(data, 'in.a.nested.set.3', 123);
	setValue(data, 'in.a.new.array.5', 123);

	expect(data.in.a.nested.array[3]).toEqual(123);
	expect(data.in.a.nested.map.get('3')).toEqual(123);
	expect(data.in.a.nested.object['3']).toEqual(123);

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
	expect(data.in.a.new.array[5]).toEqual(123);

	setValue(data, '__proto__', 123);
	setValue(data, 'constructor', 123);
	setValue(data, 'prototype', 123);

	expect(data.constructor).toBe(data.constructor);

	// @ts-expect-error - Testing JS internals
	expect(data.__proto__).toBe(data.__proto__);
	// @ts-expect-error - Testing JS internals
	expect(data.prototype).toBe(data.prototype);
});
