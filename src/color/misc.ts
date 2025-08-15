import {join} from '../internal/string';
import {defaultHex, prefixPattern} from './constants';
import {isHexColor} from './is';

/**
 * Try to get the normalized hex-color from a value
 * @param value The value to normalize
 * @returns The normalized hex-color string, or `#000000` if the value is unable to be parsed
 */
export function getNormalizedHex(value: unknown): string {
	if (!isHexColor(value)) {
		return String(defaultHex);
	}

	const normalized = value.replace(prefixPattern, '');

	return normalized.length === 3
		? join(normalized.split('').map(character => character.repeat(2)))
		: normalized;
}
