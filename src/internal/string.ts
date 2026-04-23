// #region Functions

/**
 * Get the string value from any value
 * @param value Original value
 * @returns String representation of the value
 */
export function getString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (value == null) {
		return '';
	}

	if (typeof value === 'function') {
		return getString(value());
	}

	if (typeof value !== 'object') {
		// oxlint-disable-next-line typescript/no-base-to-string: the whole point of this function is to get a string representation of any value, so calling `String` on it is fine
		return String(value);
	}

	// oxlint-disable-next-line typescript/no-base-to-string: ditto
	const asString = String(value.valueOf?.() ?? value);

	return asString.startsWith('[object ') ? JSON.stringify(value) : asString;
}

export function ignoreKey(key: string): boolean {
	return EXPRESSION_IGNORED.test(key);
}

/**
 * Join an array of values into a string _(while ignoring empty values)_
 *
 * _(`null`, `undefined`, and any values that become whitespace-only strings are considered empty)_
 * @param array Array of values
 * @param delimiter Delimiter to use between values
 * @returns Joined string
 */
export function join(array: unknown[], delimiter?: string): string {
	if (!Array.isArray(array)) {
		return '';
	}

	const {length} = array;

	if (length === 0) {
		return '';
	}

	const values: string[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = getString(array[index]);

		if (item.trim().length > 0) {
			values.push(item);
		}
	}

	return values.join(typeof delimiter === 'string' ? delimiter : '');
}

function tryCallback<T, U>(value: T, callback: (value: T) => U): U {
	try {
		return callback(value);
	} catch {
		return value as never;
	}
}

export function tryDecode(value: string): string {
	return tryCallback(value, decodeURIComponent);
}

export function tryEncode(value: boolean | number | string): unknown {
	return tryCallback(value, encodeURIComponent);
}

/**
 * Split a string into words _(and other readable parts)_
 * @param value Original string
 * @returns Array of words found in the string
 */
export function words(value: string): string[] {
	return typeof value === 'string' ? (value.match(EXPRESSION_WORDS) ?? []) : [];
}

// #endregion

// #region Variables

const EXPRESSION_IGNORED = /(^|\.)(__proto__|constructor|prototype)(\.|$)/i;

// oxlint-disable-next-line no-control-regex: Lodash uses it, so it's fine ;-)
const EXPRESSION_WORDS = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

// #endregion
