import {ArrayPosition} from '../../src';

export type TestArrayItem = {
	age: number;
	id: number;
	name: string;
};

export type TestArrayMove<Item> = {
	array?: Item[];
	key: number;
	parameters: {
		first: unknown;
		second: unknown;
	};
	result: Item[];
};

export type TestArrayPosition<Item> = {
	items: Item[];
	result: {
		endsWith: boolean;
		includes: boolean;
		indexOf: number;
		position: ArrayPosition;
		startsWith: boolean;
	};
};

const alice: TestArrayItem = {id: 1, age: 25, name: 'Alice'};
const aliceAgain: TestArrayItem = {id: 4, age: 30, name: 'Alice'};
const bob: TestArrayItem = {id: 2, age: 30, name: 'Bob'};
const charlie: TestArrayItem = {id: 3, age: 35, name: 'Charlie'};
const david: TestArrayItem = {id: 5, age: 35, name: 'David'};

const complex: TestArrayItem[] = [alice, bob, charlie, aliceAgain, david];

const keys = ['id', (item: TestArrayItem) => item.id] as Array<
	keyof TestArrayItem | ((item: TestArrayItem) => unknown)
>;

const sets = {
	complex: complex.filter((_, index) => index % 2 === 0),
	simple: [1, 3, 5],
};

const simple = [1, 2, 3, 4, 5];

const move = {
	keys,
	complex: {
		cases: [
			// Earlier -> later

			{
				key: -1,
				parameters: {first: complex[0], second: complex[4]},
				result: [complex[0], complex[1], complex[2], complex[3], complex[4]],
			},
			{
				key: 0,
				parameters: {first: complex[0], second: complex[4]},
				result: [complex[1], complex[2], complex[3], complex[4], complex[0]],
			},
			{
				key: 1,
				parameters: {first: complex[1], second: complex[3]},
				result: [complex[0], complex[2], complex[3], complex[1], complex[4]],
			},

			// Earlier -> later, array of items

			{
				key: -1,
				parameters: {first: [complex[0]], second: [complex[4]]},
				result: [complex[0], complex[1], complex[2], complex[3], complex[4]],
			},
			{
				key: 0,
				parameters: {first: [complex[0], complex[1]], second: [complex[4]]},
				result: [complex[2], complex[3], complex[4], complex[0], complex[1]],
			},
			{
				key: 1,
				parameters: {first: [complex[1]], second: [complex[3], complex[4]]},
				result: [complex[0], complex[2], complex[3], complex[4], complex[1]],
			},

			// Later -> earlier

			{
				key: -1,
				parameters: {first: complex[4], second: complex[0]},
				result: [complex[0], complex[1], complex[2], complex[3], complex[4]],
			},
			{
				key: 0,
				parameters: {first: complex[4], second: complex[0]},
				result: [complex[4], complex[0], complex[1], complex[2], complex[3]],
			},
			{
				key: 1,
				parameters: {first: complex[3], second: complex[1]},
				result: [complex[0], complex[3], complex[1], complex[2], complex[4]],
			},

			// Later -> earlier, array of items

			{
				key: -1,
				parameters: {first: [complex[4]], second: [complex[0]]},
				result: [complex[0], complex[1], complex[2], complex[3], complex[4]],
			},
			{
				key: 0,
				parameters: {first: [complex[3], complex[4]], second: [complex[0]]},
				result: [complex[3], complex[4], complex[0], complex[1], complex[2]],
			},
			{
				key: 1,
				parameters: {first: [complex[3], complex[4]], second: [complex[1]]},
				result: [complex[0], complex[3], complex[4], complex[1], complex[2]],
			},

			// Same

			{
				key: -1,
				parameters: {first: complex[0], second: complex[0]},
				result: complex,
			},

			// Invalid

			{
				array: [],
				key: -1,
				parameters: {first: complex[0], second: complex[3]},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: complex[0], second: complex[3]},
				result: [],
			},
			{
				key: -1,
				parameters: {first: [], second: complex[4]},
				result: complex,
			},
			{
				key: -1,
				parameters: {first: complex[0], second: []},
				result: complex,
			},

			// Overlap

			{
				key: -1,
				parameters: {first: [complex[1], complex[2], complex[3]], second: [complex[2], complex[3]]},
				result: complex,
			},
		] as TestArrayMove<TestArrayItem>[],
		values: complex.map(item => ({...item})),
	},
	indices: {
		cases: [
			// Earlier -> later

			{
				key: -1,
				parameters: {first: 0, second: 4},
				result: [2, 3, 4, 5, 1],
			},
			{
				key: -1,
				parameters: {first: 0, second: -1},
				result: [2, 3, 4, 5, 1],
			},

			// Later -> earlier
			{
				key: -1,
				parameters: {first: 4, second: 0},
				result: [5, 1, 2, 3, 4],
			},
			{
				key: -1,
				parameters: {first: -1, second: 0},
				result: [5, 1, 2, 3, 4],
			},

			// Same
			{
				key: -1,
				parameters: {first: 0, second: 0},
				result: simple,
			},

			// Invalid

			{
				key: -1,
				parameters: {first: 0, second: 5},
				result: [1, 2, 3, 4, 5],
			},
			{
				array: [],
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				key: -1,
				parameters: {first: 'blah' as never, second: 0},
				result: [1, 2, 3, 4, 5],
			},
			{
				key: -1,
				parameters: {first: 0, second: 'blah' as never},
				result: [1, 2, 3, 4, 5],
			},
		] as TestArrayMove<number>[],
		values: [...simple],
	},
	simple: {
		cases: [
			// Single item

			{
				key: -1,
				parameters: {first: 1, second: 5},
				result: [2, 3, 4, 5, 1],
			},
			{
				key: -1,
				parameters: {first: 5, second: 1},
				result: [5, 1, 2, 3, 4],
			},

			// Array of items

			{
				key: -1,
				parameters: {first: [1], second: [4, 5]},
				result: [2, 3, 4, 5, 1],
			},
			{
				key: -1,
				parameters: {first: [4, 5], second: [1]},
				result: [4, 5, 1, 2, 3],
			},
			{
				key: -1,
				parameters: {first: [4, 5], second: [1, 2, 3]},
				result: [4, 5, 1, 2, 3],
			},

			// Invalid

			{
				key: -1,
				parameters: {first: [], second: []},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: 1, second: 10},
				result: simple,
			},
			{
				array: [],
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				key: -1,
				parameters: {first: 'blah' as never, second: 0},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: 0, second: 'blah' as never},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: [1, 2], second: [10, 11]},
				result: simple,
			},

			// Overlap

			{
				key: -1,
				parameters: {first: [1, 2, 3], second: [2, 3]},
				result: simple,
			},
		] as TestArrayMove<number>[],
		values: [...simple],
	},
	toIndex: {
		cases: [
			// Earlier -> later

			{
				key: -1,
				parameters: {first: 1, second: 4},
				result: [2, 3, 4, 5, 1],
			},
			{
				key: -1,
				parameters: {first: 1, second: -1},
				result: [2, 3, 4, 5, 1],
			},

			// Earlier -> later, array of items

			{
				key: -1,
				parameters: {first: [1], second: 4},
				result: [2, 3, 4, 5, 1],
			},
			{
				key: -1,
				parameters: {first: [1], second: -1},
				result: [2, 3, 4, 5, 1],
			},

			// Later -> earlier

			{
				key: -1,
				parameters: {first: 5, second: 0},
				result: [5, 1, 2, 3, 4],
			},
			{
				key: -1,
				parameters: {first: 5, second: -5},
				result: [5, 1, 2, 3, 4],
			},

			// Later -> earlier, array of items

			{
				key: -1,
				parameters: {first: [5], second: 0},
				result: [5, 1, 2, 3, 4],
			},
			{
				key: -1,
				parameters: {first: [5], second: -5},
				result: [5, 1, 2, 3, 4],
			},

			// Same

			{
				key: -1,
				parameters: {first: 1, second: 0},
				result: simple,
			},

			// Invalid

			{
				key: -1,
				parameters: {first: 1, second: 10},
				result: [1, 2, 3, 4, 5],
			},
			{
				array: [],
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				key: -1,
				parameters: {first: 'blah' as never, second: 0},
				result: [1, 2, 3, 4, 5],
			},
			{
				key: -1,
				parameters: {first: 0, second: 'blah' as never},
				result: [1, 2, 3, 4, 5],
			},
		] as TestArrayMove<number>[],
		values: [...simple],
	},
};

const nested = Array.from({length: 5}, () => ({
	values: [1, 2, 3, 4, 5],
}));

const swap = {
	keys,
	complex: {
		cases: [
			// Item swap

			{
				key: -1,
				parameters: {first: complex[0], second: complex[4]},
				result: complex,
			},
			{
				key: 0,
				parameters: {first: complex[0], second: complex[4]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},
			{
				key: 1,
				parameters: {first: complex[0], second: complex[4]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},

			// Item swap, reversed

			{
				key: -1,
				parameters: {first: complex[4], second: complex[0]},
				result: complex,
			},
			{
				key: 0,
				parameters: {first: complex[4], second: complex[0]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},
			{
				key: 1,
				parameters: {first: complex[4], second: complex[0]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},

			// Array swap, single item

			{
				key: -1,
				parameters: {first: [complex[0]], second: [complex[4]]},
				result: complex,
			},
			{
				key: 0,
				parameters: {first: [complex[0]], second: [complex[4]]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},
			{
				key: 1,
				parameters: {first: [complex[0]], second: [complex[4]]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},

			// Array swap, single item, reversed

			{
				key: -1,
				parameters: {first: [complex[4]], second: [complex[0]]},
				result: complex,
			},
			{
				key: 0,
				parameters: {first: [complex[4]], second: [complex[0]]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},
			{
				key: 1,
				parameters: {first: [complex[4]], second: [complex[0]]},
				result: [complex[4], complex[1], complex[2], complex[3], complex[0]],
			},

			// Array swap

			{
				key: -1,
				parameters: {first: [complex[0], complex[1]], second: [complex[3], complex[4]]},
				result: complex,
			},
			{
				key: 0,
				parameters: {first: [complex[0], complex[1]], second: [complex[3], complex[4]]},
				result: [complex[3], complex[4], complex[2], complex[0], complex[1]],
			},
			{
				key: 1,
				parameters: {first: [complex[0], complex[1]], second: [complex[3], complex[4]]},
				result: [complex[3], complex[4], complex[2], complex[0], complex[1]],
			},

			// Array swap, reversed

			{
				key: -1,
				parameters: {first: [complex[3], complex[4]], second: [complex[0], complex[1]]},
				result: complex,
			},
			{
				key: 0,
				parameters: {first: [complex[3], complex[4]], second: [complex[0], complex[1]]},
				result: [complex[3], complex[4], complex[2], complex[0], complex[1]],
			},
			{
				key: 1,
				parameters: {first: [complex[3], complex[4]], second: [complex[0], complex[1]]},
				result: [complex[3], complex[4], complex[2], complex[0], complex[1]],
			},

			// Overlap

			{
				key: -1,
				parameters: {first: [complex[1], complex[2]], second: [complex[2], complex[3]]},
				result: complex,
			},
			{
				key: -1,
				parameters: {first: [complex[0], complex[1], complex[2]], second: [complex[1]]},
				result: complex,
			},
			{
				key: -1,
				parameters: {first: [complex[2]], second: [complex[1], complex[2], complex[3]]},
				result: complex,
			},

			// Invalid

			{
				array: [],
				key: -1,
				parameters: {first: [complex[0]], second: [complex[3]]},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: [complex[0]], second: [complex[3]]},
				result: [],
			},
			{
				key: -1,
				parameters: {first: [], second: [complex[4]]},
				result: complex,
			},
			{
				key: -1,
				parameters: {first: [complex[0]], second: []},
				result: complex,
			},
		] as TestArrayMove<TestArrayItem>[],
		values: complex.map(item => ({...item})),
	},
	indices: {
		cases: [
			// Simple swap

			{
				key: -1,
				parameters: {first: 0, second: 4},
				result: [5, 2, 3, 4, 1],
			},

			// Simple swap, reversed

			{
				key: -1,
				parameters: {first: 4, second: 0},
				result: [5, 2, 3, 4, 1],
			},

			// Simple swap, from end

			{
				key: -1,
				parameters: {first: 0, second: -2},
				result: [4, 2, 3, 1, 5],
			},

			// Simple swap, from end, reversed

			{
				key: -1,
				parameters: {first: -2, second: 0},
				result: [4, 2, 3, 1, 5],
			},

			// Invalid

			{
				key: -1,
				parameters: {first: 0, second: 10},
				result: simple,
			},
			{
				array: [],
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				key: -1,
				parameters: {first: 'blah' as never, second: 0},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: 0, second: 'blah' as never},
				result: simple,
			},
		] as TestArrayMove<number>[],
		values: [...simple],
	},
	simple: {
		cases: [
			// Simple swap

			{
				key: -1,
				parameters: {first: 1, second: 5},
				result: [5, 2, 3, 4, 1],
			},

			// Simple swap, reversed

			{
				key: -1,
				parameters: {first: 5, second: 1},
				result: [5, 2, 3, 4, 1],
			},

			// Array swap

			{
				key: -1,
				parameters: {first: [1, 2], second: [4, 5]},
				result: [4, 5, 3, 1, 2],
			},

			// Array swap, reversed

			{
				key: -1,
				parameters: {first: [4, 5], second: [1, 2]},
				result: [4, 5, 3, 1, 2],
			},

			// Array swap, single item

			{
				key: -1,
				parameters: {first: [1], second: [5]},
				result: [5, 2, 3, 4, 1],
			},

			// Array swap, single item, reversed

			{
				key: -1,
				parameters: {first: [5], second: [1]},
				result: [5, 2, 3, 4, 1],
			},

			// Overlap

			{
				key: -1,
				parameters: {first: [2, 3], second: [3, 4]},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: [simple[0], simple[1], simple[2]], second: [simple[1]]},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: [simple[2]], second: [simple[1], simple[2], simple[3]]},
				result: simple,
			},

			// Invalid

			{
				key: -1,
				parameters: {first: 1, second: 10},
				result: simple,
			},
			{
				array: [],
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				array: 'blah' as never,
				key: -1,
				parameters: {first: 0, second: 0},
				result: [],
			},
			{
				key: -1,
				parameters: {first: 'blah' as never, second: 0},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: 0, second: 'blah' as never},
				result: simple,
			},
			{
				key: -1,
				parameters: {first: [1, 2], second: [10, 11]},
				result: simple,
			},
		] as TestArrayMove<number>[],
		values: [...simple],
	},
};

const position = {
	keys,
	complex: {
		cases: [
			{
				items: complex.slice(0, 1),
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: complex.slice(1, 2),
				result: {
					endsWith: false,
					includes: true,
					indexOf: 1,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: complex.slice(2, 3),
				result: {
					endsWith: false,
					includes: true,
					indexOf: 2,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: complex.slice(3, 4),
				result: {
					endsWith: false,
					includes: true,
					indexOf: 3,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: complex.slice(4),
				result: {endsWith: true, includes: true, indexOf: 4, position: 'end', startsWith: false},
			},
			{
				items: complex.slice(0, 2),
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: complex.slice(1, 3),
				result: {
					endsWith: false,
					includes: true,
					indexOf: 1,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: complex.slice(2, 4),
				result: {
					endsWith: false,
					includes: true,
					indexOf: 2,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: complex.slice(3),
				result: {endsWith: true, includes: true, indexOf: 3, position: 'end', startsWith: false},
			},
			{
				items: complex.slice(0, 3),
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: complex.slice(1, 4),
				result: {
					endsWith: false,
					includes: true,
					indexOf: 1,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: complex.slice(2),
				result: {endsWith: true, includes: true, indexOf: 2, position: 'end', startsWith: false},
			},
			{
				items: complex.slice(0, 4),
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: complex.slice(1),
				result: {endsWith: true, includes: true, indexOf: 1, position: 'end', startsWith: false},
			},
			{
				items: complex.slice(0),
				result: {endsWith: true, includes: true, indexOf: 0, position: 'same', startsWith: true},
			},
		] as TestArrayPosition<TestArrayItem>[],
		values: complex.map(item => ({...item})),
	},
	simple: {
		cases: [
			{
				items: ['a'],
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: ['b'],
				result: {
					endsWith: false,
					includes: true,
					indexOf: 1,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: ['c'],
				result: {
					endsWith: false,
					includes: true,
					indexOf: 2,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: ['d'],
				result: {
					endsWith: false,
					includes: true,
					indexOf: 3,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: ['e'],
				result: {endsWith: true, includes: true, indexOf: 4, position: 'end', startsWith: false},
			},
			{
				items: ['a', 'b'],
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: ['b', 'c'],
				result: {
					endsWith: false,
					includes: true,
					indexOf: 1,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: ['c', 'd'],
				result: {
					endsWith: false,
					includes: true,
					indexOf: 2,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: ['d', 'e'],
				result: {endsWith: true, includes: true, indexOf: 3, position: 'end', startsWith: false},
			},
			{
				items: ['a', 'b', 'c'],
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: ['b', 'c', 'd'],
				result: {
					endsWith: false,
					includes: true,
					indexOf: 1,
					position: 'inside',
					startsWith: false,
				},
			},
			{
				items: ['c', 'd', 'e'],
				result: {endsWith: true, includes: true, indexOf: 2, position: 'end', startsWith: false},
			},
			{
				items: ['a', 'b', 'c', 'd'],
				result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
			},
			{
				items: ['b', 'c', 'd', 'e'],
				result: {endsWith: true, includes: true, indexOf: 1, position: 'end', startsWith: false},
			},
			{
				items: ['a', 'b', 'c', 'd', 'e'],
				result: {endsWith: true, includes: true, indexOf: 0, position: 'same', startsWith: true},
			},
			{
				items: ['x'],
				result: {
					endsWith: false,
					includes: false,
					indexOf: -1,
					position: 'outside',
					startsWith: false,
				},
			},
		] as TestArrayPosition<string>[],
		values: ['a', 'b', 'c', 'd', 'e'],
	},
};

export const arrayFixture = {
	complex,
	move,
	nested,
	position,
	sets,
	simple,
	swap,
	people: {
		alice,
		aliceAgain,
		bob,
		charlie,
		david,
	},
};
