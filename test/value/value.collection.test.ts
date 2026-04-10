import {expect, test} from 'vitest';
import {inMap, inSet, times, toMap, toSet} from '../../src';

const persons = times(100, index => ({
	id: index,
	name: `Person ${index}`,
}));

const person = {...persons[42]};

const values = [
	null,
	undefined,
	false,
	true,
	123n,
	'',
	'hello, world',
	Symbol('symbol'),
	[],
	{},
	() => {},
	new Date(),
	new Map(),
	new Set(),
];

test('inMap', () => {
	const personsMap = toMap(persons, 'id');

	for (const value of values) {
		expect(inMap(personsMap, value)).toBe(false);
		expect(inMap(personsMap, value, true)).toBe(undefined);
	}

	expect(inMap(personsMap, person)).toBe(true);
	expect(inMap(personsMap, person, true)).toBe(42);

	expect(inMap('blah' as never, person)).toBe(false);
	expect(inMap('blah' as never, person, true)).toBe(undefined);
});

test('inSet', () => {
	const personsSet = toSet(persons);
	const numbersSet = toSet(times(100, index => index));

	for (const value of values) {
		expect(inSet(personsSet, value)).toBe(false);
		expect(inSet(numbersSet, value)).toBe(false);
	}

	expect(inSet(personsSet, person)).toBe(true);
	expect(inSet(numbersSet, 42)).toBe(true);

	expect(inSet('blah' as never, 42)).toBe(false);
});
