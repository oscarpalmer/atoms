import {max} from '../math';
import {getNumber} from '../number';
import {getString, join, words} from '../string/index';

/**
 * Compare two values _(for sorting purposes)_
 */
export function compare(first: unknown, second: unknown): number {
	const firstParts = getParts(first);
	const secondParts = getParts(second);
	const length = max([firstParts.length, secondParts.length]);
	const lastIndex = length - 1;

	for (let index = 0; index < length; index += 1) {
		const firstPart = firstParts[index];
		const secondPart = secondParts[index];

		if (firstPart === secondPart) {
			if (index === lastIndex) {
				return 0;
			}

			continue;
		}

		if (
			firstPart == null ||
			(typeof firstPart === 'string' && firstPart.length === 0)
		) {
			return -1;
		}

		if (
			secondPart == null ||
			(typeof secondPart === 'string' && secondPart.length === 0)
		) {
			return 1;
		}

		const firstNumber = getNumber(firstPart);
		const secondNumber = getNumber(secondPart);

		const firstIsNaN = Number.isNaN(firstNumber);
		const secondIsNaN = Number.isNaN(secondNumber);

		if (firstIsNaN || secondIsNaN) {
			if (firstIsNaN && secondIsNaN) {
				return getString(firstPart).localeCompare(getString(secondPart));
			}

			if (firstIsNaN) {
				return 1;
			}

			if (secondIsNaN) {
				return -1;
			}
		}

		if (firstNumber === secondNumber) {
			if (index === lastIndex) {
				// Same value on last part? let's not fall through to string comparison
				return 0;
			}
		}

		return firstNumber - secondNumber;
	}

	return join(firstParts).localeCompare(join(secondParts));
}

function getParts(value: unknown): unknown[] {
	if (value == null) {
		return [''];
	}

	if (Array.isArray(value)) {
		return value;
	}

	return typeof value === 'object' ? [value] : words(getString(value));
}
