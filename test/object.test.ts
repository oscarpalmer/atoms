import {expect, test} from 'bun:test';
import {clone, merge} from '../src/js/object';

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

type Mergeable = {
	age?: number;
	hobbies?: string[];
	name?: {first?: string; last?: string};
	profession?: string;
};

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
