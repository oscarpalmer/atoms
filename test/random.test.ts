import {expect, test} from 'vitest';
import {
	getRandomBoolean,
	getRandomCharacters,
	getRandomColour,
	getRandomDate,
	getRandomFloat,
	getRandomHex,
	getRandomInteger,
	getRandomItem,
	getRandomItems,
} from '../src/js/random';

const size = 100_000;

async function getRandomNumber(
	callback: (min?: number, max?: number) => number,
	min?: number,
	max?: number,
): Promise<void> {
	const maxActual = max ?? Number.MAX_SAFE_INTEGER;
	const minActual = min ?? Number.MIN_SAFE_INTEGER;

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		const value = callback(minActual, maxActual);

		if (value > maxActual || value < minActual) {
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

			if (
				random.length !== 5 ||
				!random.split('').every(character => alphabet.has(character))
			) {
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
			expect(defaultFailed).toBe(false);

			done();
		}, 250);
	}));

test('getRandomColour', () => {
	const pattern = /^#[0-9A-F]{6}$/;

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		if (!pattern.test(getRandomColour())) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);
});

test('getRandomDate', () => {
	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		if (!(getRandomDate() instanceof Date)) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);

	const earliest = new Date(0);
	const latest = new Date();

	expect(getRandomDate(earliest, latest)).toBeInstanceOf(Date);
});

test('getRandomFloat', () =>
	new Promise<void>(done => {
		async function run() {
			await getRandomNumber(getRandomFloat);
			await getRandomNumber(getRandomFloat, -123.456, 456.789);

			done();
		}

		run();
	}));

test('getRandomInteger', () =>
	new Promise<void>(done => {
		async function run() {
			await getRandomNumber(getRandomInteger);
			await getRandomNumber(getRandomInteger, 0, 100);

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

test('getRandomItem', () => {
	const items = Array.from({length: 10}, (_, index) => index);

	let invalid = 0;

	for (let index = 0; index < size; index += 1) {
		const item = getRandomItem(items);

		if (!items.includes(item)) {
			invalid += 1;
		}
	}

	expect(invalid).toBe(0);
});

test('getRandomItems', () => {
	const original = [1, 2, 3, 4, 5];

	expect(getRandomItems(original, 0)).toEqual([]);
	expect(getRandomItems(original, 1)).toHaveLength(1);
	expect(getRandomItems(original, 2)).toHaveLength(2);
});
