import {expect, test} from 'vitest';
import {equal} from '../../src';
import {equalFixture} from '../.fixtures/equal.fixture';

const {
	anyValues,
	arrayBuffers,
	dataViews,
	dates,
	errors,
	primitives,
	references,
	strings,
	symbols,
} = equalFixture;

test('any', () => {
	const equalizer = equal.initialize({
		relaxedNullish: true,
	});

	const {length} = anyValues;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const outer = anyValues[outerIndex];

		for (let innerIndex = 0; innerIndex < length; innerIndex += 1) {
			const inner = anyValues[innerIndex];

			expect(equal(outer, inner)).toBe(outerIndex === innerIndex);

			expect(equalizer(outer, inner)).toBe(
				(outerIndex < 2 && innerIndex < 2) || outerIndex === innerIndex,
			);
		}
	}
});

test('array buffer', () => {
	expect(equal(arrayBuffers[0], arrayBuffers[1])).toBe(true);
	expect(equal(arrayBuffers[0], arrayBuffers[2])).toBe(false);
});

test('data view', () => {
	expect(equal(dataViews[0], dataViews[1])).toBe(true);
	expect(equal(dataViews[0], dataViews[2])).toBe(false);
	expect(equal(dataViews[3], dataViews[4])).toBe(false);
});

test('date', () => {
	expect(equal(dates[0], dates[1])).toBe(true);
	expect(equal(dates[0], dates[2])).toBe(false);
});

test('error', () => {
	expect(equal(errors[0], errors[1])).toBe(true);
	expect(equal(errors[0], errors[2])).toBe(false);
});

test('object', () => {
	expect(equal({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
	expect(equal({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
	expect(equal({a: 1, b: 2}, {a: 1, b: 3})).toBe(false);
	expect(equal({a: 1, b: 2}, {a: 1})).toBe(false);
});

test('options', () => {
	const symbol = Symbol('test');

	const firstObject = {[symbol]: 99, a: 1, b: 2};
	const secondObject = {[symbol]: 99, a: 1, b: 2, c: 3};

	expect(equal(firstObject, secondObject)).toBe(false);

	expect(equal(firstObject, secondObject, {ignoreKeys: 'c'})).toBe(true);
	expect(equal(firstObject, secondObject, {ignoreKeys: ['c']})).toBe(true);
	expect(equal(firstObject, secondObject, {ignoreKeys: /^c/})).toBe(true);
	expect(equal(firstObject, secondObject, {ignoreKeys: [/^c/]})).toBe(true);

	const firstString = 'alpha';
	const secondString = 'aLpHa';

	expect(equal(firstString, secondString)).toBe(false);
	expect(equal(firstString, secondString), {ignoreCase: 123} as never).toBe(false);
	expect(equal(firstString, secondString, true)).toBe(true);
	expect(equal(firstString, secondString, {ignoreCase: true})).toBe(true);
});

test('primitive', () => {
	for (const [first, second, result] of primitives) {
		expect(equal(first, second)).toBe(result as never);
	}

	expect(equal(strings[0], strings[1])).toBe(false);
	expect(equal(strings[0], strings[1], true)).toBe(true);
});

test('regular expression', () => {
	expect(equal(/foo/, /foo/)).toBe(true);
	expect(equal(/foo/g, /foo/i)).toBe(false);
	expect(equal(/foo/, /bar/)).toBe(false);
});

test('symbol', () => {
	expect(equal(symbols[0], symbols[0])).toBe(true);
	expect(equal(symbols[0], symbols[1])).toBe(false);
});

test('references', () => {
	expect(equal(references[0], references[0])).toBe(true);
	expect(equal(references[0], references[1])).toBe(false);
});
