import {expect, test} from 'vitest';
import {
	getRandomBoolean,
	getRandomCharacters,
	getRandomColor,
	getRandomFloat,
	getRandomHex,
	getRandomInteger,
	getRandomItem,
	getRandomItems,
} from '../src/random';

const size = 100_000;

async function getRandomNumber(
	callback: (min?: number, max?: number) => number,
	flipped: boolean,
	min?: number,
	max?: number,
): Promise<void> {
	let maxActual: number;
	let minActual: number;

	if (typeof max === 'number') {
		maxActual = max;
	} else {
		maxActual = flipped ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
	}

	if (typeof min === 'number') {
		minActual = min;
	} else {
		minActual = flipped ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
	}

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		const value = callback(min, max);

		if (
			value > (flipped ? minActual : maxActual) + 1 ||
			value < (flipped ? maxActual : minActual)
		) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);
}

test('getRandomBoolean', () => {
	const booleans = new Set<boolean>([false, true]);

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		if (!booleans.has(getRandomBoolean())) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);
});

test('getRandomCharacters', () =>
	new Promise<void>(done => {
		const alphabet = new Set('abcdefghijklmnopqrstuvwxyz');
		const size = 100_000;

		let defaultFailed = false;

		for (let index = 0; index < size; index += 1) {
			const random = getRandomCharacters(5);

			if (random.length !== 5 || !random.split('').every(character => alphabet.has(character))) {
				defaultFailed = true;
			}
		}

		const selection = 'aeiouåäö';

		let selectionFailed = false;

		for (let index = 0; index < size; index += 1) {
			const random = getRandomCharacters(5, selection);

			if (
				random.length !== 5 ||
				!random.split('').every(character => selection.includes(character))
			) {
				selectionFailed = true;
			}
		}

		setTimeout(() => {
			expect(getRandomCharacters(-99)).toBe('');
			expect(defaultFailed).toBe(false);
			expect(selectionFailed).toBe(false);

			done();
		}, 250);
	}));

test('getRandomColor', () => {
	const prefixed = /^#[0-9A-F]{6}$/;
	const unprefixed = /^[0-9A-F]{6}$/;

	let invalid = 0;

	for (let index = 0; index < size; index += 1) {
		invalid += unprefixed.test(getRandomColor()) ? 0 : 1;
		invalid += prefixed.test(getRandomColor(true)) ? 0 : 1;
	}

	expect(invalid).toBe(0);
});

test('getRandomFloat', () =>
	new Promise<void>(done => {
		async function run() {
			await getRandomNumber(getRandomFloat, false);
			await getRandomNumber(getRandomFloat, false, -123.456, 456.789);
			await getRandomNumber(getRandomFloat, true, 456.789, -123.456);

			await getRandomNumber(getRandomFloat, false, 'blah' as never, 'blah' as never);

			done();
		}

		run();
	}));

test('getRandomHex', () => {
	const possible = new Set<string>('0123456789ABCDEF');

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		const hex = getRandomHex();

		if (!possible.has(hex)) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);
});

test('getRandomInteger', () =>
	new Promise<void>(done => {
		async function run() {
			await getRandomNumber(getRandomInteger, false);
			await getRandomNumber(getRandomInteger, false, 0, 100);
			await getRandomNumber(getRandomInteger, true, 100, 0);

			await getRandomNumber(getRandomInteger, false, 'blah' as never, 'blah' as never);

			done();
		}

		run();
	}));

test('getRandomItem', () => {
	const items = Array.from({length: 10}, (_, index) => index);

	let invalid = 0;

	for (let index = 0; index < size; index += 1) {
		const item = getRandomItem(items);

		if (item === undefined || !items.includes(item)) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);

	expect(getRandomItem([])).toBe(undefined);
	expect(getRandomItem([1])).toBe(1);
});

test('getRandomItems', () => {
	const original = [1, 2, 3, 4, 5];

	expect(getRandomItems(original, 0)).toEqual([]);
	expect(getRandomItems(original, 1)).toHaveLength(1);
	expect(getRandomItems(original, 2)).toHaveLength(2);

	expect(getRandomItems(original, -1).length).toBe(original.length);
	expect(getRandomItems(original, 99).length).toBe(original.length);

	expect(getRandomItems([])).toEqual([]);
	expect(getRandomItems([1])).toEqual([1]);
});
