import {assert} from '../../internal/function/assert';
import type {GenericCallback} from '../index';
import type {UnwrapValue} from '../result.model';
import type {Asserter} from './assert.model';

// #region Types

/**
 * An asynchronous _Flow_, a function that pipes a value through a series of functions
 */
export type AsyncFlow<Callback extends GenericCallback, Value> = (
	...args: Parameters<Callback>
) => Promise<UnwrapValue<Value>>;

/**
 * A synchronous _Flow_, a function that pipe a value through a series of functions
 */
export type Flow<Callback extends GenericCallback, Value> = (
	...args: Parameters<Callback>
) => UnwrapValue<Value>;

/**
 * Rejects any function in a list that returns a promise, for use with synchronous work
 */
export type SyncFunctions<Functions extends unknown[]> = {
	[Key in keyof Functions]: Functions[Key] extends GenericCallback
		? SyncValue<ReturnType<Functions[Key]>>
		: unknown;
};

/**
 * Rejects an initial value that is a promise, or a callback returning a promise, for use with synchronous work
 *
 * _(Wraps the whole parameter, as intersecting it with a gate breaks inference for union types; `Allowed` is the parameter type for valid values)_
 */
export type SyncInitial<Initial, Allowed = Initial> = Initial extends
	| Promise<unknown>
	| (() => Promise<unknown>)
	? never
	: Allowed;

/**
 * Rejects a value that is, or may be, a promise, for use with synchronous work
 *
 * _(Resolves to `unknown` for valid values _(including `any`)_ and `never` otherwise, so it can be intersected with the value's own type)_
 */
export type SyncValue<Value> = 0 extends 1 & Value
	? unknown
	: [Extract<Value, Promise<unknown>>] extends [never]
		? unknown
		: never;

// #endregion

// #region Variables

export const WORK_MESSAGE_FLOW_ARRAY = `'flow' expected to receive an array of functions`;

export const WORK_MESSAGE_FLOW_PROMISE = `'flow' received a promise; if the callback is asynchronous, prefix it with 'async'`;

export const WORK_MESSAGE_NESTING = 'Return values are too deeply nested';

export const WORK_MESSAGE_PIPE_ARRAY = `'pipe' expected to receive an array of functions`;

export const WORK_MESSAGE_PIPE_PROMISE = `'pipe' received a promise; if the callback is asynchronous, prefix it with 'async'`;

export const assertFlowFunctions: Asserter<Function[]> = assert.condition(
	value => Array.isArray(value) && value.every(item => typeof item === 'function'),
	WORK_MESSAGE_FLOW_ARRAY,
	TypeError,
);

export const assertPipeFunctions: Asserter<Function[]> = assert.condition(
	value => Array.isArray(value) && value.every(item => typeof item === 'function'),
	WORK_MESSAGE_PIPE_ARRAY,
	TypeError,
);

// #endregion
