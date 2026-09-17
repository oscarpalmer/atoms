import {getNumberOrDefault} from '../internal/defaults';
import {isPlainObject} from '../internal/is';
import {error, ok} from '../internal/result/misc';
import type {PlainObject, RequiredKeys} from '../models';
import {
	PROMISE_STRATEGY_ALL,
	PROMISE_STRATEGY_DEFAULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
} from './constants';
import {
	type FulfilledPromise,
	type PromiseOptions,
	type PromisesOptions,
	type PromiseStrategy,
	type PromisesValue,
	type RejectedPromise,
} from './models';

// #region Functions

export function createPromiseOptions(input: unknown): RequiredKeys<PromiseOptions, 'time'> {
	if (typeof input === 'number') {
		return {
			time: getNumberOrDefault(input, 0),
		};
	}

	if (input instanceof AbortSignal) {
		return {signal: input, time: 0};
	}

	const options = isPlainObject(input) ? input : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		time: getNumberOrDefault(options.time, 0),
	};
}

export function createPromisesOptions(input: unknown): RequiredKeys<PromisesOptions, 'strategy'> {
	if (typeof input === 'string') {
		return {
			strategy: getStrategyOrDefault(input),
		};
	}

	if (input instanceof AbortSignal) {
		return {signal: input, strategy: PROMISE_STRATEGY_DEFAULT};
	}

	const options = isPlainObject(input) ? input : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		strategy: getStrategyOrDefault(options.strategy),
	};
}

export function getResultsFromPromises(
	promised: Array<PromisesValue<unknown>> | Record<string, PromisesValue<unknown>>,
): unknown {
	const isArray = Array.isArray(promised);

	const entries = isArray
		? promised.map((value, index) => [index, value] as const)
		: Object.entries(promised);

	const {length} = entries;

	const results = isArray ? [] : {};

	for (let index = 0; index < length; index += 1) {
		const [key, value] = entries[index];

		(results as PlainObject)[key] = isFulfilled(value) ? ok(value.value) : error(value.reason);
	}

	return results;
}

export function getStrategyOrDefault(value: unknown): PromiseStrategy {
	return PROMISE_STRATEGY_ALL.has(value as never) ? (value as never) : PROMISE_STRATEGY_DEFAULT;
}

/**
 * Is the value a fulfilled _Promise_ result?
 *
 * @param value Value to check
 * @returns `true` if the value is a fulfilled _Promise_ result, otherwise `false`
 */
export function isFulfilled<Value>(value: unknown): value is FulfilledPromise<Value> {
	return isType(value, PROMISE_TYPE_FULFILLED);
}

/**
 * Is the value a rejected _Promise_ result?
 *
 * @param value Value to check
 * @returns `true` if the value is a rejected _Promise_ result, otherwise `false`
 */
export function isRejected(value: unknown): value is RejectedPromise {
	return isType(value, PROMISE_TYPE_REJECTED);
}

function isType(value: unknown, type: string): boolean {
	return isPlainObject(value) && 'status' in value && value.status === type;
}

// #endregion
