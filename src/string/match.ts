import {memoize, type Memoized} from '../function/memoize';

// #region Types

type Match = 'endsWith' | 'includes' | 'startsWith';

// #endregion

// #region Functions

/**
 * Check if a string ends with a specified substring
 * @param haystack String to look in
 * @param needle String to look for
 * @param ignoreCase Ignore case when matching? _(defaults to `false`)_
 * @returns `true` if the string ends with the given substring, otherwise `false`
 */
export function endsWith(haystack: string, needle: string, ignoreCase?: boolean): boolean {
	return match('endsWith', haystack, needle, ignoreCase === true);
}

/**
 * Check if a string includes a specified substring
 * @param haystack String to look in
 * @param needle String to look for
 * @param ignoreCase Ignore case when matching? _(defaults to `false`)_
 * @returns `true` if the string includes the given substring, otherwise `false`
 */
export function includes(haystack: string, needle: string, ignoreCase?: boolean): boolean {
	return match('includes', haystack, needle, ignoreCase === true);
}

function match(type: Match, haystack: string, needle: string, ignoreCase: boolean): boolean {
	if (typeof haystack !== 'string' || typeof needle !== 'string') {
		return false;
	}

	matchMemoizers[type] ??= memoize(matchCallback.bind(type));

	return matchMemoizers[type].run(haystack, needle, ignoreCase);
}

function matchCallback(
	this: Match,
	haystack: string,
	needle: string,
	ignoreCase: boolean,
): boolean {
	return (ignoreCase ? haystack.toLocaleLowerCase() : haystack)[this](
		ignoreCase ? needle.toLocaleLowerCase() : needle,
	);
}

/**
 * Check if a string starts with a specified substring
 * @param haystack String to look in
 * @param needle String to look for
 * @param ignoreCase Ignore case when matching? _(defaults to `false`)_
 * @returns `true` if the string starts with the given substring, otherwise `false`
 */
export function startsWith(haystack: string, needle: string, ignoreCase?: boolean): boolean {
	return match('startsWith', haystack, needle, ignoreCase === true);
}

// #endregion

// #region Variables

const matchMemoizers: Partial<Record<Match, Memoized<typeof matchCallback>>> = {};

// #endregion
