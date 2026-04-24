import {memoize, type Memoized} from '../function/memoize';
import {isPlainObject} from '../internal/is';
import {lowerCase} from './case';

// #region Types

/**
 * Options for normalizing a string
 */
export type NormalizeOptions = {
	/**
	 * Remove diacritical marks from the string? _(defaults to `true`)_
	 */
	deburr?: boolean;
	/**
	 * Convert the string to lower case? _(defaults to `true`)_
	 */
	lowerCase?: boolean;
	/**
	 * Remove special characters from the string? _(defaults to `false`)_
	 *
	 * _(Punctuation and symbol characters are considered special)_
	 */
	special?: boolean;
	/**
	 * Trim the string? _(defaults to `true`)_
	 */
	trim?: boolean;
	/**
	 * Shorten consecutive whitespace characters to a single space? _(defaults to `true`)_
	 */
	whitespace?: boolean;
};

/**
 * String normalizer function
 */
export type Normalizer = {
	/**
	 * Normalize a string
	 * @param value String to normalize
	 * @returns Normalized string
	 */
	(value: string): string;
};

type Options = Required<NormalizeOptions>;

// #endregion

// #region Functions

/**
 * Deburr a string, removing diacritical marks
 * @param value String to deburr
 * @returns Deburred string
 */
export function deburr(value: string): string {
	if (typeof value !== 'string') {
		return '';
	}

	deburrMemoizer ??= memoize(value => {
		let deburred = value.normalize(DEBURR_NORMALIZATION).replace(DEBURR_PATTERN_SIMPLE, '');

		deburred = deburred.replace(
			DEBURR_PATTERN_CHARACTERS,
			(_, character) => DEBURR_CHARACTERS[character as keyof typeof DEBURR_CHARACTERS],
		);

		return deburred;
	});

	return deburrMemoizer.run(value);
}

function getNormalizeOptions(input?: NormalizeOptions): Options {
	const options = isPlainObject(input) ? input : {};

	return {
		deburr: options.deburr !== false,
		lowerCase: options.lowerCase !== false,
		special: options.special === true,
		trim: options.trim !== false,
		whitespace: options.whitespace !== false,
	};
}

/**
 * Initialize a string normalizer
 * @param options Normalization options
 * @returns Normalizer function
 */
export function initializeNormalizer(options?: NormalizeOptions): Normalizer {
	const normalization = getNormalizeOptions(options);

	return (value: string) => normalizeString(value, normalization);
}

/**
 * Normalize a string
 *
 * By default, the string will be trimmed, deburred, and then lowercased
 * @param value String to normalize
 * @param options Normalization options
 * @returns Normalized string
 */
export function normalize(value: string, options?: NormalizeOptions): string {
	return normalizeString(value, getNormalizeOptions(options));
}

normalize.initialize = initializeNormalizer;

function normalizeString(value: string, options: Options): string {
	if (typeof value !== 'string') {
		return '';
	}

	let result = value;

	if (options.trim) {
		result = result.trim();
	}

	if (options.whitespace) {
		result = result.replace(WHITESPACE_PATTERN, WHITESPACE_REPLACEMENT);
	}

	if (options.deburr) {
		result = deburr(result);
	}

	if (options.lowerCase) {
		result = lowerCase(result);
	}

	if (options.special) {
		result = result.replace(SPECIAL_PATTERN, SPECIAL_REPLACEMENT);
	}

	return result.normalize(NORMALIZATION_NORMALIZATION);
}

// #endregion

// #region Variables

const DEBURR_CHARACTERS = {
	Æ: 'AE',
	æ: 'ae',
	Ð: 'D',
	ð: 'd',
	Đ: 'D',
	đ: 'd',
	Ħ: 'H',
	ħ: 'h',
	Ĳ: 'IJ',
	ĳ: 'ij',
	İ: 'I',
	ı: 'i',
	ĸ: 'k',
	Ŀ: 'L',
	ŀ: 'l',
	Ł: 'L',
	ł: 'l',
	Ŋ: 'N',
	ŋ: 'n',
	ŉ: "'n",
	Œ: 'OE',
	œ: 'oe',
	Ø: 'O',
	ø: 'o',
	ſ: 's',
	ß: 'ss',
	Þ: 'TH',
	þ: 'th',
	Ŧ: 'T',
	ŧ: 't',
};

const DEBURR_NORMALIZATION = 'NFD';

const DEBURR_PATTERN_CHARACTERS = new RegExp(`(${Object.keys(DEBURR_CHARACTERS).join('|')})`, 'g');

const DEBURR_PATTERN_SIMPLE = /[\u0300-\u036f]/g;

const NORMALIZATION_NORMALIZATION = 'NFC';

const SPECIAL_PATTERN = /[\p{P}\p{S}]/gu;

const SPECIAL_REPLACEMENT = '';

const WHITESPACE_PATTERN = /\s+/g;

const WHITESPACE_REPLACEMENT = ' ';

let deburrMemoizer: Memoized<typeof deburr>;

// #endregion
