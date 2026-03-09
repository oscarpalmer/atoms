import {expect, test} from 'vitest';
import {
	endsWithArray,
	getArrayPosition,
	includesArray,
	indexOfArray,
	startsWithArray,
} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const {complex, position} = arrayFixture;

const haystack = complex.map(item => ({...item}));

test('simple', () => {
	const {values} = position.simple;

	for (let index = 0; index < position.simple.cases.length; index += 1) {
		const {items, result} = position.simple.cases[index];

		const endsWith = endsWithArray(values, items);
		const includes = includesArray(values, items);
		const indexOf = indexOfArray(values, items);
		const pos = getArrayPosition(values, items);
		const startsWith = startsWithArray(values, items);

		expect(endsWith).toBe(result.endsWith);
		expect(includes).toBe(result.includes);
		expect(indexOf).toBe(result.indexOf);
		expect(pos).toBe(result.position);
		expect(startsWith).toBe(result.startsWith);
	}

	expect(getArrayPosition('blah' as never, [])).toBe('invalid');
	expect(getArrayPosition([], 'blah' as never)).toBe('invalid');
	expect(getArrayPosition([], [])).toBe('outside');
	expect(getArrayPosition(values, [])).toBe('outside');
	expect(getArrayPosition(['a'], ['a', 'b'])).toBe('outside');
	expect(getArrayPosition(values, ['a', 'c', 'b'])).toBe('outside');
});

test('complex', () => {
	const {keys} = position;

	for (let index = 0; index < position.complex.length; index += 1) {
		const {items, result} = position.complex[index];

		for (const key of keys) {
			const endsWith = endsWithArray(haystack, items, key);
			const includes = includesArray(haystack, items, key);
			const indexOf = indexOfArray(haystack, items, key);
			const position = getArrayPosition(haystack, items, key);
			const startsWith = startsWithArray(haystack, items, key);

			expect(endsWith).toBe(result.endsWith);
			expect(includes).toBe(result.includes);
			expect(indexOf).toBe(result.indexOf);
			expect(position).toBe(result.position);
			expect(startsWith).toBe(result.startsWith);
		}
	}
});
