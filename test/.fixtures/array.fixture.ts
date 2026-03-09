import {ArrayPosition} from '../../src';

export type TestArrayItem = {
	age: number;
	id: number;
	name: string;
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

const complex: TestArrayItem[] = [
	{id: 1, age: 25, name: 'Alice'},
	{id: 2, age: 30, name: 'Bob'},
	{id: 3, age: 35, name: 'Charlie'},
	{id: 4, age: 30, name: 'Alice'},
	{id: 5, age: 35, name: 'David'},
];

const sets = {
	complex: complex.filter((_, index) => index % 2 === 0),
	simple: [1, 3, 5],
};

const simple = [1, 2, 3, 4, 5];

const position = {
	complex: [
		{
			items: complex.slice(0, 1),
			result: {endsWith: false, includes: true, indexOf: 0, position: 'start', startsWith: true},
		},
		{
			items: complex.slice(1, 2),
			result: {endsWith: false, includes: true, indexOf: 1, position: 'inside', startsWith: false},
		},
		{
			items: complex.slice(2, 3),
			result: {endsWith: false, includes: true, indexOf: 2, position: 'inside', startsWith: false},
		},
		{
			items: complex.slice(3, 4),
			result: {endsWith: false, includes: true, indexOf: 3, position: 'inside', startsWith: false},
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
			result: {endsWith: false, includes: true, indexOf: 1, position: 'inside', startsWith: false},
		},
		{
			items: complex.slice(2, 4),
			result: {endsWith: false, includes: true, indexOf: 2, position: 'inside', startsWith: false},
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
			result: {endsWith: false, includes: true, indexOf: 1, position: 'inside', startsWith: false},
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
	] satisfies TestArrayPosition<TestArrayItem>[],
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
		] satisfies TestArrayPosition<string>[],
		values: ['a', 'b', 'c', 'd', 'e'],
	},
	keys: ['id', (item: TestArrayItem) => item.id] as never[],
};

export const arrayFixture = {
	complex,
	position,
	sets,
	simple,
};
