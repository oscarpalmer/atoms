import {memoize} from '../internal/function/memoize';
import {isPlainObject} from '../internal/is';
import {lowerCase} from '../internal/string/case';
import type {Memoized} from '../models/function/memoize.model';
import {EXPRESSION_WHITESPACE_MULTIPLE} from '../models/misc.model';
import {
	NORMALIZE_DEBURR_CHARACTERS,
	NORMALIZE_DEBURR_NORMALIZATION,
	NORMALIZE_DEBURR_PATTERN_CHARACTERS,
	NORMALIZE_DEBURR_PATTERN_SIMPLE,
	NORMALIZE_NORMALIZATION_NORMALIZATION,
	NORMALIZE_SPECIAL_PATTERN,
	NORMALIZE_SPECIAL_REPLACEMENT,
	NORMALIZE_SYMBOL,
	NORMALIZE_WHITESPACE_REPLACEMENT,
	type InternalNormalizer,
	type NormalizeOptions,
	type Normalizer,
	type NormalizerOptions,
} from '../models/string/string.normalize.model';

// #region Instances

function Normalizer(this: any, options: NormalizerOptions): void {
	this[NORMALIZE_SYMBOL] = options;
}

Normalizer.prototype.normalize = normalizeString;

// #endregion

// #region Functions

function createNormalizerOptions(input?: NormalizeOptions): NormalizerOptions {
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
	return new Normalizer(createNormalizerOptions(options));
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
	return normalizeString.call(createNormalizerOptions(options), value);
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
		result = result.replace(EXPRESSION_WHITESPACE_MULTIPLE, NORMALIZE_WHITESPACE_REPLACEMENT);
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

let deburrMemoizer: Memoized<typeof deburr>;

// #endregion

// #region Namespace

export declare namespace normalize {
	export var initialize: typeof initializeNormalizer;
}

// #endregion

// #region Initialization

normalize.initialize = initializeNormalizer;

// #endregion

// #region Exports

export type {NormalizeOptions, Normalizer};

// #endregion
