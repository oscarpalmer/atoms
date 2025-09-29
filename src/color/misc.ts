import {join} from '../internal/string';
import {EXPRESSION_PREFIX, HEX_BLACK} from './constants';
import {isHexColor} from './is';

/**
 * Try to get the normalized hex-color from a value
 * @param value Value to normalize
 * @returns Normalized hex-color string, or `000000` if the value is unable to be normalized
 */
export function getNormalizedHex(value: unknown): string {
	if (!isHexColor(value)) {
		return String(HEX_BLACK);
	}

	const normalized = value.replace(EXPRESSION_PREFIX, '');

	return normalized.length === SHORT_LENGTH
		? join(normalized.split('').map(character => character.repeat(2)))
		: normalized;
}

//

const SHORT_LENGTH = 3;
