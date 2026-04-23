import {expect, test} from 'vitest';
import {fuzzy, fuzzyMatch} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const {complex, people} = arrayFixture;

const greek = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

test('basic', () => {
	const fuzzyGreek = fuzzy(greek);
	const fuzzyHello = fuzzy(['Hello', 'Helllllo']);

	expect(fuzzyGreek.search('a')).toEqual({
		exact: ['Alpha', 'Beta', 'Delta', 'Gamma'],
		similar: [],
	});

	expect(fuzzyGreek.search('aa')).toEqual({
		exact: [],
		similar: ['Alpha', 'Gamma'],
	});

	expect(fuzzyGreek.search('ea')).toEqual({
		exact: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		fuzzyHello.search('eo', {
			limit: 10,
		}),
	).toEqual({
		exact: [],
		similar: ['Hello', 'Helllllo'],
	});

	expect(
		fuzzyHello.search('eo', {
			limit: 1,
		}),
	).toEqual({
		exact: [],
		similar: ['Hello'],
	});

	expect(
		fuzzyHello.search('eo', {
			tolerance: 0,
		}),
	).toEqual({
		exact: [],
		similar: [],
	});

	expect(
		fuzzyHello.search('eo', {
			tolerance: 2,
		}),
	).toEqual({
		exact: [],
		similar: ['Hello'],
	});

	const greetings = ['Hiya', 'Howdy'];

	fuzzyHello.items = greetings;

	expect(fuzzyHello.items).toEqual(greetings);
	expect(fuzzyHello.strings).toEqual(greetings);

	expect(fuzzyHello.search('eo')).toEqual({
		exact: [],
		similar: [],
	});

	expect(fuzzyHello.search('w')).toEqual({
		exact: ['Howdy'],
		similar: [],
	});

	fuzzyHello.items = 'blah' as never;

	expect(fuzzyHello.search('w')).toEqual({
		exact: ['Howdy'],
		similar: [],
	});

	expect(() => fuzzy([''], 123 as never)).toThrow(TypeError);
	expect(() => fuzzy(123 as never)).toThrow(TypeError);
});

test('complex', () => {
	const fuzzyItems = fuzzy(complex, item => item.name);

	expect(fuzzyItems.items).toEqual(complex);
	expect(fuzzyItems.strings).toEqual(complex.map(item => item.name));

	expect(fuzzyItems.search('')).toEqual(fuzzy(complex, 'name').search(''));

	expect(fuzzyItems.search('')).toEqual(
		fuzzy(complex, {
			key: 'name',
		}).search(''),
	);

	expect(
		fuzzy(complex, {
			key: 'name',
		}),
	).toEqual(
		fuzzy(complex, {
			handler: item => item.name,
		}),
	);

	expect(fuzzyItems.search(123 as never)).toEqual({
		exact: complex,
		similar: [],
	});

	expect(fuzzyItems.search('')).toEqual({
		exact: complex,
		similar: [],
	});

	expect(fuzzyItems.search('   ')).toEqual({
		exact: complex,
		similar: [],
	});

	expect(fuzzyItems.search('', 1)).toEqual({
		exact: [complex[0]],
		similar: [],
	});

	expect(fuzzyItems.search('', 'blah' as never)).toEqual({
		exact: complex,
		similar: [],
	});

	expect(
		fuzzyItems.search('', {
			limit: 1,
		}),
	).toEqual({
		exact: [complex[0]],
		similar: [],
	});

	expect(
		fuzzyItems.search('', {
			limit: 'blah' as never,
		}),
	).toEqual({
		exact: complex,
		similar: [],
	});

	expect(fuzzyItems.search('al')).toEqual({
		exact: [people.alice, people.aliceAgain],
		similar: [people.charlie],
	});

	expect(
		fuzzyItems.search('al', {
			tolerance: 0,
		}),
	).toEqual({
		exact: [people.alice, people.aliceAgain],
		similar: [],
	});
});

test('match', () => {
	const aResults = [true, true, true, true, false];
	const aaResults = [true, false, true, false, false];
	const eaResults = [false, true, false, true, false];

	for (let index = 0; index < greek.length; index += 1) {
		const item = greek[index];

		expect(fuzzy.match(item, 'a')).toBe(aResults[index]);
		expect(fuzzy.match(item, 'aa')).toBe(aaResults[index]);
		expect(fuzzy.match(item, 'ea')).toBe(eaResults[index]);
	}

	expect(fuzzyMatch(123 as never, 'a')).toBe(false);
	expect(fuzzyMatch('a', 123 as never)).toBe(false);
});

test('options', () => {
	const searcher = fuzzy(greek);

	expect(
		searcher.search('', {
			limit: 2,
		}),
	).toEqual({
		exact: greek.slice(0, 2),
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: 100,
		}),
	).toEqual({
		exact: greek,
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: -1,
		}),
	).toEqual({
		exact: greek,
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: Number.NaN,
		}),
	).toEqual({
		exact: greek,
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: 'blah' as never,
		}),
	).toEqual({
		exact: greek,
		similar: [],
	});

	expect(searcher.search('ea')).toEqual({
		exact: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 0,
		}),
	).toEqual({
		exact: [],
		similar: [],
	});

	expect(
		searcher.search('ea', {
			tolerance: 1,
		}),
	).toEqual({
		exact: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 100,
		}),
	).toEqual({
		exact: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: -1,
		}),
	).toEqual({
		exact: [],
		similar: [],
	});

	expect(
		searcher.search('ea', {
			tolerance: Number.NaN,
		}),
	).toEqual({
		exact: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 'blah' as never,
		}),
	).toEqual({
		exact: [],
		similar: ['Beta', 'Delta'],
	});
});
