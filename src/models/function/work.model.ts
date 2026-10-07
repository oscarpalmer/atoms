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

// #endregion

// #region Variables

export const WORK_MESSAGE_FLOW_ARRAY = 'Flow expected to receive an array of functions';

export const WORK_MESSAGE_FLOW_PROMISE =
	'Synchronous Flow received a promise. Use `flow.async` instead.';

export const WORK_MESSAGE_NESTING = 'Return values are too deeply nested.';

export const WORK_MESSAGE_PIPE_ARRAY = 'Pipe expected to receive an array of functions';

export const WORK_MESSAGE_PIPE_PROMISE =
	'Synchronous Pipe received a promise. Use `pipe.async` instead.';

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
