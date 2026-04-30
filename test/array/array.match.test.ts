import {expect, test} from 'vitest';
import {
	endsWithArray,
	getArrayComparison,
	includesArray,
	indexOfArray,
	startsWithArray,
} from '../../src';
import {arrayFixture, TestArrayItem} from '../.fixtures/array.fixture';

const {complex, match} = arrayFixture;

const haystack = complex.map(item => ({...item}));

test('simple', () => {
	const {values} = match.simple;

	for (let index = 0; index < match.simple.cases.length; index += 1) {
		const {items, result} = match.simple.cases[index];

		const endsWith = endsWithArray(values, items);
		const includes = includesArray(values, items);
		const indexOf = indexOfArray(values, items);
		const comparison = getArrayComparison(values, items);
		const startsWith = startsWithArray(values, items);

		expect(endsWith).toBe(result.endsWith);
		expect(includes).toBe(result.includes);
		expect(indexOf).toBe(result.indexOf);
		expect(comparison).toBe(result.comparison);
		expect(startsWith).toBe(result.startsWith);
	}

	expect(getArrayComparison('blah' as never, [])).toBe('invalid');
	expect(getArrayComparison([], 'blah' as never)).toBe('invalid');
	expect(getArrayComparison([], [])).toBe('outside');
	expect(getArrayComparison(values, [])).toBe('outside');
	expect(getArrayComparison(['a'], ['a', 'b'])).toBe('outside');
	expect(getArrayComparison(values, ['a', 'c', 'b'])).toBe('outside');
});

test('complex', () => {
	const {keys} = match;

	for (let index = 0; index < match.complex.cases.length; index += 1) {
		const {items, result} = match.complex.cases[index];

		for (const key of keys) {
			const endsWith = endsWithArray(haystack, items, key as keyof TestArrayItem);
			const includes = includesArray(haystack, items, key as keyof TestArrayItem);
			const indexOf = indexOfArray(haystack, items, key as keyof TestArrayItem);
			const comparison = getArrayComparison(haystack, items, key as keyof TestArrayItem);
			const startsWith = startsWithArray(haystack, items, key as keyof TestArrayItem);

			expect(endsWith).toBe(result.endsWith);
			expect(includes).toBe(result.includes);
			expect(indexOf).toBe(result.indexOf);
			expect(comparison).toBe(result.comparison);
			expect(startsWith).toBe(result.startsWith);
		}
	}
});
