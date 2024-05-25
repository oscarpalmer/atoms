import {expect, test} from 'bun:test';
import {
	getRandomBoolean,
	getRandomColor,
	getRandomDate,
	getRandomFloat,
	getRandomHex,
	getRandomInteger,
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

test('getRandomColor', () => {
	const pattern = /^#[0-9A-F]{6}$/;

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		if (!pattern.test(getRandomColor())) {
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

test('getRandomFloat', async done => {
	await getRandomNumber(getRandomFloat);
	await getRandomNumber(getRandomFloat, -123.456, 456.789);

	done();
});

test('getRandomInteger', async done => {
	await getRandomNumber(getRandomInteger);
	await getRandomNumber(getRandomInteger, 0, 100);

	done();
});

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
