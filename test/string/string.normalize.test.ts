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
	const spaces = '     ';
	const modified = `${spaces}${original.split(' ').join(spaces)}${spaces}`;

	expect(normalize(modified)).toBe(
		"ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t",
	);

	// Trim

	expect(
		normalize(modified, {
			trim: false,
		}),
	).toBe(" ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t ");

	expect(
		normalize(modified, {
			trim: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Whitespace

	expect(
		normalize(modified, {
			whitespace: false,
		}),
	).toBe(
		`ae${spaces}ae${spaces}d${spaces}d${spaces}d${spaces}d${spaces}h${spaces}h${spaces}ij${spaces}ij${spaces}i${spaces}i${spaces}k${spaces}l${spaces}l${spaces}l${spaces}l${spaces}n${spaces}n${spaces}'n${spaces}oe${spaces}oe${spaces}o${spaces}o${spaces}s${spaces}ss${spaces}th${spaces}th${spaces}t${spaces}t`,
	);

	expect(
		normalize(modified, {
			whitespace: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Deburr

	expect(
		normalize(modified, {
			deburr: false,
		}),
	).toBe('æ æ ð ð đ đ ħ ħ ĳ ĳ i̇ ı ĸ ŀ ŀ ł ł ŋ ŋ ŉ œ œ ø ø ſ ß þ þ ŧ ŧ');

	expect(
		normalize(modified, {
			deburr: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Lowercase

	expect(
		normalize(modified, {
			lowerCase: false,
		}),
	).toBe(deburred);

	expect(
		normalize(modified, {
			lowerCase: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	// Special

	expect(
		normalize(modified, {
			special: true,
		}),
	).toBe('ae ae d d d d h h ij ij i i k l l l l n n n oe oe o o s ss th th t t');

	expect(
		normalize(modified, {
			special: 123 as never,
		}),
	).toBe("ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t");

	const specialCharacters = '!@#$%^&*()_+-=[]{}|;\':",.<>?~`';

	const extraSpecial = `${specialCharacters}${original}${specialCharacters}`;

	expect(
		normalize(extraSpecial, {
			special: true,
		}),
	).toBe('ae ae d d d d h h ij ij i i k l l l l n n n oe oe o o s ss th th t t');

	expect(
		normalize(extraSpecial, {
			special: 123 as never,
		}),
	).toBe(
		`${specialCharacters}ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t${specialCharacters}`,
	);

	// Initializer

	expect(normalize.initialize()(modified)).toBe(
		"ae ae d d d d h h ij ij i i k l l l l n n 'n oe oe o o s ss th th t t",
	);

	// Error

	expect(normalize(123 as never)).toBe('');
});
