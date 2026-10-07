import {ok} from '../internal/result/misc';
import type {Ok} from '../models/result.model';

// #region Functions

/**
 * Create an immediately failing plan
 *
 * @param reason Failure reason
 * @returns Plan failure
 */
export function fail<Reason>(reason: Reason): Generator<Reason, void> {
	return (function* () {
		throw reason;
	})();
}

/**
 * Create an immediately succeeding plan
 *
 * @param value Success value
 * @returns Plan success
 */
export function succeed<Value>(value: Value): Generator<never, Value> {
	return (function* () {
		return value;
	})();
}

export function succeedResult<Returned>(value: Returned): Generator<never, Ok<Returned>> {
	return (function* () {
		return ok(value);
	})();
}

// #endregion

// #region Namespace

export declare namespace succeed {
	export var result: typeof succeedResult;
}

// #endregion

// #region Initialization

succeed.result = succeedResult;

// #endregion
