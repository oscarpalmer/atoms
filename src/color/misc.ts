import {defaultHex, prefixPattern} from './constants';
import {isHexColor} from './is';

/**
 * Try to get the normalized hex-color from a value _(defaults to `#000000`)_
 */
export function getNormalizedHex(value: unknown): string {
	if (!isHexColor(value)) {
		return String(defaultHex);
	}

	const normalized = value.replace(prefixPattern, '');

	return normalized.length === 3
		? normalized
				.split('')
				.map(character => character.repeat(2))
				.join('')
		: normalized;
}
