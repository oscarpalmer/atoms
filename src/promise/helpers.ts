import type {RequiredKeys} from '../models';
import {error, ok} from '../result';
import type {Result} from '../result/models';
import {
	PROMISE_STRATEGY_ALL,
	PROMISE_STRATEGY_DEFAULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
	type FulfilledPromise,
	type PromiseOptions,
	type PromisesOptions,
	type PromiseStrategy,
	type PromisesValue,
	type RejectedPromise,
} from './models';

// #region Functions

function getNumberOrDefault(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : 0;
}

export function getPromiseOptions(input: unknown): RequiredKeys<PromiseOptions, 'time'> {
	if (typeof input === 'number') {
		return {
			time: getNumberOrDefault(input),
		};
	}

	if (input instanceof AbortSignal) {
		return {signal: input, time: 0};
	}

	const options = typeof input === 'object' && input !== null ? (input as PromiseOptions) : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		time: getNumberOrDefault(options.time),
	};
}

export function getPromisesOptions(input: unknown): RequiredKeys<PromisesOptions, 'strategy'> {
	if (typeof input === 'string') {
		return {
			strategy: getStrategyOrDefault(input),
		};
	}

	if (input instanceof AbortSignal) {
		return {signal: input, strategy: PROMISE_STRATEGY_DEFAULT};
	}

	const options = typeof input === 'object' && input !== null ? (input as PromisesOptions) : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		strategy: getStrategyOrDefault(options.strategy),
	};
}

export function getResultsFromPromises<Value>(
	promised: PromisesValue<Value>[],
): Result<Value>[] {
	return promised.map(result =>
		isFulfilled(result) ? ok(result.value) : error(result.reason),
	) as Result<Value>[];
}

export function getStrategyOrDefault(value: unknown): PromiseStrategy {
	return PROMISE_STRATEGY_ALL.has(value as PromiseStrategy)
		? (value as PromiseStrategy)
		: PROMISE_STRATEGY_DEFAULT;
}

/**
 * Is the value a fulfilled promise result?
 * @param value Value to check
 * @returns `true` if the value is a fulfilled promise result, `false` otherwise
 */
export function isFulfilled<Value>(value: unknown): value is FulfilledPromise<Value> {
	return isType(value, PROMISE_TYPE_FULFILLED);
}

/**
 * Is the value a rejected promise result?
 * @param value Value to check
 * @returns `true` if the value is a rejected promise result, `false` otherwise
 */
export function isRejected(value: unknown): value is RejectedPromise {
	return isType(value, PROMISE_TYPE_REJECTED);
}

function isType(value: unknown, type: string): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as PromisesValue<unknown>).status === type
	);
}

// #endregion
