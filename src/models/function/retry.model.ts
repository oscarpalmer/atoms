import type {ErrorJson} from '../misc.model';
import {toJsonError, toPojoError} from '../../internal/json';

// #region Types

/**
 * An error thrown when a retry fails
 */
export class RetryError extends Error {
	constructor(
		message: string,
		readonly original: unknown,
	) {
		super(message);

		this.name = RETRY_ERROR_NAME;
	}

	/**
	 * Get the _JSON_ representation of the error
	 *
	 * @returns _JSON_ representation
	 */
	toJSON(): RetryErrorJson {
		return {
			...toPojoError(this),
			original: toJsonError(this.original),
		};
	}
}

export type RetryErrorJson = {
	original: unknown;
} & ErrorJson;

export type RetryOptions = {
	delay?: number;
	times?: number;
	when?: (error: unknown) => boolean;
};

// #endregion

// #region Variables

export const RETRY_ERROR_NAME = 'RetryError';

export const RETRY_MESSAGE_CALLBACK = `'retry' expected a function`;

export const RETRY_MESSAGE_PROMISE = `Synchronous 'retry' received a promise; if the callback is asynchronous, prefix it with 'async'`;

export const RETRY_MESSAGE_FAILED = 'Retry failed';

// #endregion
