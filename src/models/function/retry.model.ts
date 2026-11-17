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
}

export type RetryOptions = {
	delay?: number;
	times?: number;
	when?: (error: unknown) => boolean;
};

// #endregion

// #region Variables

export const RETRY_ERROR_NAME = 'RetryError';

export const RETRY_MESSAGE_CALLBACK = `'retry' expected a function`;

export const RETRY_MESSAGE_VALUE = `'retry' received a promise; if the callback is asynchronous, prefix it with 'async'`;

export const RETRY_MESSAGE_FAILED = 'Retry failed';

// #endregion
