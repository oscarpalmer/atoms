import {isArrayOrPlainObject} from '../internal/is';
import type {ArrayOrPlainObject, PlainObject, UnionToIntersection} from '../models';
import {
	type AssignOptions,
	type Assigner,
	type InternalAssigner,
	type InternalMerger,
	type MergeOptions,
	type MergeReplaceableObjectsCallback,
	type Merger,
	type MergingOptions,
	MERGE_SYMBOL_ASSIGN,
	MERGE_SYMBOL_MERGE,
} from '../models/value/value.merge.model';

// #region Instances

function Assigner(this: any, options: MergingOptions): void {
	this[MERGE_SYMBOL_ASSIGN] = {
		...options,
		assignValues: true,
	};
}

Assigner.prototype.assign = assignFromAssigner;

function Merger(this: any, options: MergingOptions): void {
	this[MERGE_SYMBOL_MERGE] = options;
}

Merger.prototype.merge = mergeFromMerger;

// #endregion

// #region Functions

/**
 * Assign values from one or more objects to the first one
 *
 * @param to Value to assign to
 * @param from Values to assign
 * @param options Assigning options
 * @returns Assigned value
 */
export function assign<To extends PlainObject, From extends PlainObject[]>(
	to: To,
	from: [...From],
	options?: AssignOptions,
): To & UnionToIntersection<From[number]> {
	const actual = createMergingOptions(options);

	actual.assignValues = true;

	return mergeValues([to, ...from], actual) as To & UnionToIntersection<From[number]>;
}

function assignFromAssigner(this: InternalAssigner, to: PlainObject, from: PlainObject[]) {
	return mergeValues([to, ...from], this[MERGE_SYMBOL_ASSIGN]);
}

function createMergingOptions(input?: unknown): MergingOptions {
	const actual: MergingOptions = {
		assignValues: false,
		replaceableObjects: undefined,
		skipNullableAny: false,
		skipNullableInArrays: false,
	};

	if (typeof input !== 'object' || input == null) {
		return actual;
	}

	const options = input as PlainObject;

	actual.replaceableObjects = getReplaceableObjects(options.replaceableObjects);

	actual.assignValues = options.assignValues === true;
	actual.skipNullableAny = options.skipNullableAny === true;
	actual.skipNullableInArrays = options.skipNullableInArrays === true;

	return actual;
}

function getReplaceableObjects(value: unknown): MergeReplaceableObjectsCallback | undefined {
	const items = (Array.isArray(value) ? value : [value]).filter(
		item => typeof item === 'string' || item instanceof RegExp,
	);

	if (items.length === 0) {
		return undefined;
	}

	return (name: string) =>
		items.some(item => (typeof item === 'string' ? item === name : item.test(name)));
}

/**
 * Create an assigner with predefined options
 *
 * _Available as `initializeAssigner` and `assign.initialize`_
 *
 * @param options Assigning options
 * @returns Assigner function
 */
export function initializeAssigner(options?: AssignOptions): Assigner {
	// @ts-expect-error All good, no worries :-)
	return new Assigner(createMergingOptions(options));
}

/**
 * Create a merger with predefined options
 *
 * _Available as `initializeMerger` and `merge.initialize`_
 *
 * @param options Merging options
 * @returns Merger function
 */
export function initializeMerger(options?: MergeOptions): Merger {
	// @ts-expect-error All good, no worries :-)
	return new Merger(createMergingOptions(options));
}

/**
 * Merge multiple arrays or objects into a single one
 *
 * @param values Values to merge
 * @param options Merging options
 * @returns Merged value
 */
export function merge<Values extends ArrayOrPlainObject[]>(
	values: [...Values],
	options?: MergeOptions,
): UnionToIntersection<Values[number]> {
	return mergeValues(values, createMergingOptions(options)) as UnionToIntersection<Values[number]>;
}

function mergeFromMerger(this: InternalMerger, values: ArrayOrPlainObject[]): ArrayOrPlainObject {
	return mergeValues(values, this[MERGE_SYMBOL_MERGE]);
}

function mergeObjects(
	values: ArrayOrPlainObject[],
	options: MergingOptions,
	destination?: ArrayOrPlainObject,
	prefix?: string,
): ArrayOrPlainObject {
	const {length} = values;

	const isArray = Array.isArray(destination ?? values[0]);
	const merged = (destination ?? (isArray ? [] : {})) as PlainObject;

	const offset = destination == null ? 0 : 1;

	for (let outerIndex = offset; outerIndex < length; outerIndex += 1) {
		const item = values[outerIndex] as PlainObject;
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];

			const next = item[key];
			const previous = merged[key];

			if (next == null && (options.skipNullableAny || (isArray && options.skipNullableInArrays))) {
				continue;
			}

			const full =
				options.replaceableObjects == null ? undefined : prefix == null ? key : `${prefix}.${key}`;

			if (
				isArrayOrPlainObject(next) &&
				isArrayOrPlainObject(previous) &&
				!(options.replaceableObjects?.(full!) ?? false)
			) {
				merged[key] = mergeObjects(
					[previous, next],
					options,
					(destination == null ? undefined : merged[key]) as ArrayOrPlainObject,
					full,
				);
			} else {
				merged[key] = next;
			}
		}
	}

	return merged;
}

function mergeValues(
	values: ArrayOrPlainObject[],
	options: MergingOptions,
	prefix?: string,
): ArrayOrPlainObject {
	if (!Array.isArray(values)) {
		return {};
	}

	const actual = values.filter(isArrayOrPlainObject);

	if (actual.length === 0) {
		return {};
	}

	if (
		options.assignValues &&
		actual.length === 2 &&
		!Array.isArray(actual[0]) &&
		Object.keys(actual[0]).length === 0
	) {
		return Object.assign(actual[0], actual[1]);
	}

	if (actual.length > 1) {
		return mergeObjects(actual, options, options.assignValues ? actual[0] : undefined, prefix);
	}

	return options.assignValues
		? actual[0]
		: Array.isArray(actual[0])
			? actual[0].slice()
			: {...actual[0]};
}

// #endregion

// #region Namespace

export declare namespace assign {
	export var initialize: typeof initializeAssigner;
}

export declare namespace merge {
	export var initialize: typeof initializeMerger;
}

// #endregion

// #region Initialization

assign.initialize = initializeAssigner;
merge.initialize = initializeMerger;

// #endregion

// #region Exports

export type {AssignOptions, Assigner, MergeOptions, Merger};

// #endregion
