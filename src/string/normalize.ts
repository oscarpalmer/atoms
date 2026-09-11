import {memoize, type Memoized} from '../internal/function/memoize';
import {isPlainObject} from '../internal/is';
import {lowerCase} from '../internal/string/case';

// #region Types

type InternalNormalizer = {
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

type Options = Required<NormalizeOptions>;

// #endregion

// #region Instances

function Normalizer(this: any, options: Required<NormalizeOptions>) {
	Object.defineProperty(this, NORMALIZE_SYMBOL, {
		value: options,
	});
}

Object.defineProperties(Normalizer.prototype, {
	normalize: {
		value: normalizeString,
	},
});

// #endregion

// #region Functions

function createNormalizeOptions(input?: NormalizeOptions): Options {
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
 * Deburr a string, removing diacritical marks
 *
 * @param value String to deburr
 * @returns Deburred string
 */
export function deburr(value: string): string {
	if (typeof value !== 'string') {
		return '';
	}

	deburrMemoizer ??= memoize(value => {
		let deburred = value
			.normalize(NORMALIZE_DEBURR_NORMALIZATION)
			.replace(NORMALIZE_DEBURR_PATTERN_SIMPLE, '');

		deburred = deburred.replace(
			NORMALIZE_DEBURR_PATTERN_CHARACTERS,
			(_, character) =>
				NORMALIZE_DEBURR_CHARACTERS[character as keyof typeof NORMALIZE_DEBURR_CHARACTERS],
		);

		return deburred;
	});

	return deburrMemoizer.run(value);
}

/**
 * Initialize a string normalizer
 *
 * _Available as `initializeNormalizer` and `normalize.initialize`_
 *
 * @param options Normalization options
 * @returns Normalizer function
 */
export function initializeNormalizer(options?: NormalizeOptions): Normalizer {
	// @ts-expect-error All good, no worries :-)
	return new Normalizer(createNormalizeOptions(options));
}

/**
 * Normalize a string
 *
 * _By default, the string will be trimmed, deburred, and then lowercased_
 *
 * @param value String to normalize
 * @param options Normalization options
 * @returns Normalized string
 */
export function normalize(value: string, options?: NormalizeOptions): string {
	return normalizeString.call(createNormalizeOptions(options), value);
}

function normalizeString(
	this: InternalNormalizer | Required<NormalizeOptions>,
	value: string,
): string {
	if (typeof value !== 'string') {
		return '';
	}

	const options = NORMALIZE_SYMBOL in this ? this[NORMALIZE_SYMBOL] : this;

	let result = value;

	if (options.trim) {
		result = result.trim();
	}

	if (options.whitespace) {
		result = result.replace(NORMALIZE_WHITESPACE_PATTERN, NORMALIZE_WHITESPACE_REPLACEMENT);
	}

	if (options.deburr) {
		result = deburr(result);
	}

	if (options.lowerCase) {
		result = lowerCase(result);
	}

	if (options.special) {
		result = result.replace(NORMALIZE_SPECIAL_PATTERN, NORMALIZE_SPECIAL_REPLACEMENT);
	}

	return result.normalize(NORMALIZE_NORMALIZATION_NORMALIZATION);
}

// #endregion

// #region Variables

const NORMALIZE_DEBURR_CHARACTERS = {
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

const NORMALIZE_DEBURR_NORMALIZATION = 'NFD';

const NORMALIZE_DEBURR_PATTERN_CHARACTERS = new RegExp(
	`(${Object.keys(NORMALIZE_DEBURR_CHARACTERS).join('|')})`,
	'g',
);

const NORMALIZE_DEBURR_PATTERN_SIMPLE = /[\u0300-\u036f]/g;

const NORMALIZE_NORMALIZATION_NORMALIZATION = 'NFC';

const NORMALIZE_SPECIAL_PATTERN = /[\p{P}\p{S}]/gu;

const NORMALIZE_SPECIAL_REPLACEMENT = '';

const NORMALIZE_SYMBOL = Symbol('normalize');

const NORMALIZE_WHITESPACE_PATTERN = /\s+/g;

const NORMALIZE_WHITESPACE_REPLACEMENT = ' ';

let deburrMemoizer: Memoized<typeof deburr>;

// #endregion

// #region Initialization

normalize.initialize = initializeNormalizer;

Object.defineProperty(normalize, 'initialize', {
	value: initializeNormalizer,
});

// #endregion
