import {expect, test} from 'vitest';
import {equal} from '../../src/internal/value/equal';
import {equalFixture} from '../.fixtures/equal.fixture';

const {maps, sets, typedArrays} = equalFixture;

test('array', () => {
	expect(equal([1, 2, 3], [1, 2, 3])).toBe(true);
	expect(equal([1, 2, 3], [3, 2, 1])).toBe(false);
	expect(equal([1, 2, 3], [1, 2])).toBe(false);

	const first_1 = Array.from({length: 100}, (_, index) => index);
	const second_1 = Array.from({length: 100}, (_, index) => index);

	second_1[2] = second_1[2] + 1;

	expect(equal(first_1, second_1)).toBe(false);

	const first_2 = Array.from({length: 100}, (_, index) => index);
	const second_2 = Array.from({length: 100}, (_, index) => index);

	second_2[98] = second_2[98] + 1;

	expect(equal(first_2, second_2)).toBe(false);

	const first_3 = Array.from({length: 100}, (_, index) => index);
	const second_3 = Array.from({length: 100}, (_, index) => index);

	second_3[50] = 9999;

	expect(equal(first_3, second_3)).toBe(false);

	const first_4 = Array.from({length: 10_000}, (_, index) => index);
	const second_4 = Array.from({length: 10_000}, (_, index) => index);

	second_4[9999] = second_4[9999] + 1;

	expect(equal(first_4, second_4)).toBe(false);
});

test('map', () => {
	const [first, second] = maps;

	expect(equal(first, second)).toBe(true);

	second.set('d', 4);

	expect(equal(first, second)).toBe(false);

	first.set('e', 5);

	expect(equal(first, second)).toBe(false);

	first.delete('e');
	second.delete('d');

	first.set('a', 99);

	expect(equal(first, second)).toBe(false);
});

test('set', () => {
	let [first, second] = sets[0];

	expect(equal(first, second)).toBe(true);

	second.add(4);

	expect(equal(first, second)).toBe(false);

	[first, second] = sets[1];

	expect(equal(first, second)).toBe(false);

	const firstNested = new Set([{id: 1}, {id: 2}]);
	const secondNested = new Set([{id: 2}, {id: 1}]);

	expect(equal(firstNested, secondNested)).toBe(true);
});

test('typed array', () => {
	const [base, first, second, third] = typedArrays;
	const {length} = base;

	for (let baseIndex = 0; baseIndex < length; baseIndex += 1) {
		const baseItem = base[baseIndex];

		for (let sameIndex = 0; sameIndex < length; sameIndex += 1) {
			const sameItem = base[sameIndex];

			expect(equal(baseItem, sameItem)).toBe(baseIndex === sameIndex);
		}

		for (let firstIndex = 0; firstIndex < length; firstIndex += 1) {
			const firstItem = first[firstIndex];

			expect(equal(baseItem, firstItem)).toBe(baseIndex === firstIndex);
		}

		for (let secondIndex = 0; secondIndex < length; secondIndex += 1) {
			const secondItem = second[secondIndex];

			expect(equal(baseItem, secondItem)).toBe(false);
		}

		for (let thirdIndex = 0; thirdIndex < length; thirdIndex += 1) {
			const thirdItem = third[thirdIndex];

			expect(equal(baseItem, thirdItem)).toBe(false);
		}
	}
});
