import {expect, test} from 'vitest';
import {deburr, normalize} from '../../src';

const original = 'Æ æ Ð ð Đ đ Ħ ħ Ĳ ĳ İ ı ĸ Ŀ ŀ Ł ł Ŋ ŋ ŉ Œ œ Ø ø ſ ß Þ þ Ŧ ŧ';

const deburred = "AE ae D d D d H h IJ ij I i k L l L l N n 'n OE oe O o s ss TH th T t";

test('deburr', () => {
	expect(deburr(original)).toBe(deburred);
	expect(deburr('')).toBe('');
	expect(deburr(123 as never)).toBe('');
});

test('normalize', () => {
	const padded = `     ${original}     `;

	expect(normalize(padded)).toBe(
		"ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t",
	);

	// Trim

	expect(
		normalize(padded, {
			trim: false,
		}),
	).toBe("     ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t     ");

	expect(
		normalize(padded, {
			trim: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Deburr

	expect(
		normalize(padded, {
			deburr: false,
		}),
	).toBe('æ æ ð ð đ đ ħ ħ ĳ ĳ i̇ ı ĸ ŀ ŀ ł ł ŋ ŋ ŉ œ œ ø ø ſ ß þ þ ŧ ŧ');

	expect(
		normalize(padded, {
			deburr: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Lowercase

	expect(
		normalize(padded, {
			lowerCase: false,
		}),
	).toBe(deburred);

	expect(
		normalize(padded, {
			lowerCase: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Initializer

	expect(normalize.initialize()(padded)).toBe(
		"ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t",
	);

	// Error

	expect(normalize(123 as never)).toBe('');
});
