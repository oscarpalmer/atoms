import {expect, test} from 'vite-plus/test';
import {fuzzy, fuzzyMatch, isFuzzy} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';
import {isFixture} from '../.fixtures/is.fixture';

const {complex, people} = arrayFixture;

const airs = ['Chair', 'Flair'];

const greek = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

const sortedComplex = [people.alice, people.aliceAgain, people.bob, people.charlie, people.david];

const sortedGreek = ['Alpha', 'Beta', 'Delta', 'Epsilon', 'Gamma'];

test('boundaries', () => {
	expect(fuzzy(['toMap', 'bitmap-map']).search('map')).toEqual({
		exact: [],
		included: ['toMap', 'bitmap-map'],
		similar: [],
	});

	expect(fuzzy(['getMessage', 'XMLParser']).search('gm')).toEqual({
		exact: [],
		included: [],
		similar: ['getMessage'],
	});

	expect(fuzzy(['İstanbulMap']).search('istanbul')).toEqual({
		exact: [],
		included: [],
		similar: ['İstanbulMap'],
	});
});

test('compare', () => {
	expect(
		fuzzy(airs, {
			compare: (first: string, second: string) => second.localeCompare(first),
		}).search('a'),
	).toEqual({
		exact: [],
		included: ['Flair', 'Chair'],
		similar: [],
	});

	expect(
		fuzzy(airs, {
			compare: 123 as never,
		}).search('a'),
	).toEqual({
		exact: [],
		included: ['Chair', 'Flair'],
		similar: [],
	});
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

	const keyed = fuzzy(complex, {
		key: 'name',
	});

	const handled = fuzzy(complex, {
		handler: item => item.name,
	});

	expect(keyed.search('a')).toEqual(handled.search('a'));

	expect(fuzzyItems.search(123 as never)).toEqual({
		exact: sortedComplex,
		included: [],
		similar: [],
	});

	expect(fuzzyItems.search('')).toEqual({
		exact: sortedComplex,
		included: [],
		similar: [],
	});

	expect(fuzzyItems.search('   ')).toEqual({
		exact: sortedComplex,
		included: [],
		similar: [],
	});

	expect(fuzzyItems.search('', 1)).toEqual({
		exact: [complex[0]],
		included: [],
		similar: [],
	});

	expect(fuzzyItems.search('', 'blah' as never)).toEqual({
		exact: sortedComplex,
		included: [],
		similar: [],
	});

	expect(
		fuzzyItems.search('', {
			limit: 1,
		}),
	).toEqual({
		exact: [complex[0]],
		included: [],
		similar: [],
	});

	expect(
		fuzzyItems.search('', {
			limit: 'blah' as never,
		}),
	).toEqual({
		exact: sortedComplex,
		included: [],
		similar: [],
	});

	expect(fuzzyItems.search('al')).toEqual({
		exact: [],
		included: [people.alice, people.aliceAgain],
		similar: [people.charlie],
	});

	expect(
		fuzzyItems.search('al', {
			tolerance: 0,
		}),
	).toEqual({
		exact: [],
		included: [people.alice, people.aliceAgain],
		similar: [people.charlie],
	});
});

test('errors', () => {
	expect(() => fuzzy([''], true as never)).toThrow(TypeError);
	expect(() => fuzzy(123 as never)).toThrow(TypeError);

	const searcher = fuzzy(greek);

	expect(() => {
		searcher.items = 'blah' as never;
	}).toThrow(TypeError);

	expect(searcher.items).toEqual(greek);
});

test('exact', () => {
	expect(fuzzy([...greek, 'BETA']).search('beta')).toEqual({
		exact: ['Beta', 'BETA'],
		included: [],
		similar: [],
	});
});

test('greek', () => {
	const searcher = fuzzy(greek);

	expect(searcher.search('a')).toEqual({
		exact: [],
		included: ['Alpha', 'Gamma', 'Beta', 'Delta'],
		similar: [],
	});

	expect(searcher.search('a', 2)).toEqual({
		exact: [],
		included: ['Alpha', 'Gamma'],
		similar: [],
	});

	expect(searcher.search('aa')).toEqual({
		exact: [],
		included: [],
		similar: ['Alpha', 'Gamma'],
	});

	expect(searcher.search('ea')).toEqual({
		exact: [],
		included: [],
		similar: ['Beta', 'Delta'],
	});
});

test('greetings', () => {
	const searcher = fuzzy(['Hello', 'Helllllo']);

	expect(
		searcher.search('eo', {
			limit: 10,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Hello', 'Helllllo'],
	});

	expect(
		searcher.search('eo', {
			limit: 1,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Hello'],
	});

	expect(
		searcher.search('eo', {
			tolerance: 0,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Hello'],
	});

	expect(
		searcher.search('eo', {
			tolerance: 2,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Hello'],
	});

	const greetings = ['Hiya', 'Howdy'];

	searcher.items = greetings;

	expect(searcher.items).toEqual(greetings);
	expect(searcher.strings).toEqual(greetings);

	expect(searcher.search('eo')).toEqual({
		exact: [],
		included: [],
		similar: [],
	});

	expect(searcher.search('w')).toEqual({
		exact: [],
		included: ['Howdy'],
		similar: [],
	});
});

test('is', () => {
	const {length, values} = isFixture;

	for (let index = 0; index < length; index += 1) {
		expect(isFuzzy(values[index])).toBe(false);
	}

	expect(fuzzy.is(fuzzy(greek))).toBe(true);
});

test('keys', () => {
	expect(fuzzy([{1: 'One'}], 1).search('One')).toEqual({
		exact: [{1: 'One'}],
		included: [],
		similar: [],
	});

	const key = Symbol('key');

	expect(fuzzy([{[key]: 'Symbol'}], key).search('Symbol')).toEqual({
		exact: [{[key]: 'Symbol'}],
		included: [],
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
		exact: sortedGreek.slice(0, 2),
		included: [],
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: 100,
		}),
	).toEqual({
		exact: sortedGreek,
		included: [],
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: -1,
		}),
	).toEqual({
		exact: sortedGreek,
		included: [],
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: Number.NaN,
		}),
	).toEqual({
		exact: sortedGreek,
		included: [],
		similar: [],
	});

	expect(
		searcher.search('', {
			limit: 'blah' as never,
		}),
	).toEqual({
		exact: sortedGreek,
		included: [],
		similar: [],
	});

	expect(searcher.search('ea')).toEqual({
		exact: [],
		included: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 0,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Beta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 1,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 100,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: -1,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Beta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: Number.NaN,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Beta', 'Delta'],
	});

	expect(
		searcher.search('ea', {
			tolerance: 'blah' as never,
		}),
	).toEqual({
		exact: [],
		included: [],
		similar: ['Beta', 'Delta'],
	});
});

test('scoring', () => {
	expect(fuzzy(['abcxabbc']).search('ac')).toEqual({
		exact: [],
		included: [],
		similar: ['abcxabbc'],
	});

	expect(fuzzy(airs).search('Airplane')).toEqual({
		exact: [],
		included: [],
		similar: [],
	});
});
