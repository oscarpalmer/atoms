// #region Types

export type InternalNormalizer = {
	[NORMALIZE_SYMBOL]: Required<NormalizeOptions>;
} & Normalizer;

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
	 *
	 * @param value String to normalize
	 * @returns Normalized string
	 */
	normalize(value: string): string;
};

export type NormalizerOptions = Required<NormalizeOptions>;

// #endregion

// #region Variables

export const NORMALIZE_DEBURR_CHARACTERS = {
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

export const NORMALIZE_DEBURR_NORMALIZATION = 'NFD';

export const NORMALIZE_DEBURR_PATTERN_CHARACTERS: RegExp = new RegExp(
	`(${Object.keys(NORMALIZE_DEBURR_CHARACTERS).join('|')})`,
	'g',
);

export const NORMALIZE_DEBURR_PATTERN_SIMPLE: RegExp = /[\u0300-\u036f]/g;

export const NORMALIZE_NORMALIZATION_NORMALIZATION: string = 'NFC';

export const NORMALIZE_SPECIAL_PATTERN: RegExp = /[\p{P}\p{S}]/gu;

export const NORMALIZE_SPECIAL_REPLACEMENT = '';

export const NORMALIZE_SYMBOL: unique symbol = Symbol('normalize');

export const NORMALIZE_WHITESPACE_REPLACEMENT = ' ';

// #endregion
