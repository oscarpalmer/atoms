import type {GenericCallback, PlainObject} from '../../models';
import type {ArrayFindParameters, ArrayFindResult} from '../../models/array/array.misc.model';

// #region Functions

function findComplexValues(
	array: unknown[],
	length: number,
	parameters: ArrayFindParameters,
	callback: GenericCallback,
): ArrayFindResult | undefined {
	let result: ArrayFindResult | undefined;

	for (let index = 0; index < length; index += 1) {
		const item = array[parameters.reverse ? length - 1 - index : index];

		if (!callback(item, index, array)) {
			continue;
		}

		result ??= {values: []};

		result.values.push(parameters.indiced ? index : item);

		if (parameters.limit == null || result.values.length === parameters.limit) {
			return result;
		}
	}

	return result;
}

function findBareValue(array: unknown[], reverse: boolean): ArrayFindResult {
	const index = reverse ? array.length - 1 : 0;

	return {
		values: [array[index]],
	};
}

function findSimpleValue(
	array: unknown[],
	first: unknown,
	indiced: boolean,
	reverse: boolean,
): ArrayFindResult | undefined {
	const method = reverse ? 'findLastIndex' : 'findIndex';

	const index =
		typeof first === 'function'
			? array[method](first as GenericCallback)
			: array[method](item => Object.is(item, first));

	return index === -1
		? undefined
		: {
				values: [indiced ? index : array[index]],
			};
}

export function findValue(
	array: unknown[],
	parameters: ArrayFindParameters,
): ArrayFindResult | undefined {
	if (!Array.isArray(array)) {
		return undefined;
	}

	const arrayLength = array.length;

	if (arrayLength === 0) {
		return undefined;
	}

	const inputLength = parameters.input.length;

	if (inputLength === 0 && parameters.bare) {
		return findBareValue(array, parameters.reverse ?? false);
	}

	const [first, second] = parameters.input;

	if (inputLength === 1 && !parameters.limit) {
		return findSimpleValue(array, first, parameters.indiced ?? false, parameters.reverse ?? false);
	}

	const callback =
		inputLength === 1 && typeof first === 'function'
			? (first as GenericCallback)
			: getCallback(first, second);

	return callback == null ? undefined : findComplexValues(array, arrayLength, parameters, callback);
}

function getCallback(first: unknown, second: unknown): GenericCallback | undefined {
	switch (true) {
		case typeof first === 'function':
			return (item: unknown, index: number, array: unknown[]) =>
				Object.is((first as GenericCallback)(item, index, array), second);

		case typeof first === 'number' || typeof first === 'string':
			return (item: PlainObject) => Object.is(item[first], second);

		default:
			return undefined;
	}
}

// #endregion
