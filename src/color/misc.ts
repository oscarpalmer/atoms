import {join} from '../internal/string';
import {DEFAULT_HEX, EXPRESSION_PREFIX} from './constants';
import {isHexColor} from './is';

/**
 * Try to get the normalized hex-color from a value
 * @param value The value to normalize
 * @returns The normalized hex-color string, or `#000000` if the value is unable to be parsed
 */
export function getNormalizedHex(value: unknown): string {
	if (!isHexColor(value)) {
		return String(DEFAULT_HEX);
	}

	const normalized = value.replace(EXPRESSION_PREFIX, '');

	return normalized.length === SHORT_LENGTH
		? join(normalized.split('').map(character => character.repeat(2)))
		: normalized;
}

//

const SHORT_LENGTH = 3;
