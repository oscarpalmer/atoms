import type {Constructor, GenericCallback} from '../../models';
import {isNonConstructor} from '../is';

type Options = {
	callback: GenericCallback;
	method?: string;
};

export function getCompareHandlers<Value>(owner: GenericCallback, options: Options) {
	const handlers = getHandlers(owner, options);

	return {
		deregister(constructor: Constructor) {
			handlers.deregister(constructor);
		},
		handle(first: unknown, second: unknown, ...parameters: unknown[]): Value {
			const handler = handlers.get(first, second);

			if (handler == null) {
				return options.callback(first, second, ...parameters);
			}

			return typeof handler === 'function'
				? handler(first, second)
				: (first as any)[handler](second);
		},
		register(constructor: Constructor, handler?: string | GenericCallback) {
			handlers.register(constructor, handler);
		},
	};
}

function getHandlers(owner: GenericCallback, options: Options) {
	const handlers = new WeakMap<Constructor, string | GenericCallback>();

	return {
		deregister(constructor: Constructor) {
			handlers.delete(constructor);
		},
		get(first: unknown, second: unknown): string | GenericCallback | undefined {
			if (
				isConstructable(first) &&
				isConstructable(second) &&
				(first as object).constructor === (second as object).constructor
			) {
				return handlers.get((first as object).constructor as Constructor);
			}
		},
		register(constructor: Constructor, handler?: string | GenericCallback) {
			if (isNonConstructor(constructor) || handler === owner) {
				return;
			}

			let actual: string | GenericCallback | undefined = handler ?? options.method;

			if (typeof actual !== 'function' && typeof actual !== 'string') {
				return;
			}

			if (typeof actual === 'string') {
				actual = typeof constructor.prototype[actual] === 'function' ? actual : undefined;
			}

			if (actual != null) {
				handlers.set(constructor, actual);
			}
		},
	};
}

export function getSelfHandlers(owner: GenericCallback, options: Options) {
	const handlers = getHandlers(owner, options);

	return {
		deregister(constructor: Constructor) {
			handlers.deregister(constructor);
		},
		handle(value: unknown, ...parameters: unknown[]) {
			const handler = handlers.get(value, value);

			if (handler == null) {
				return options.callback(value, ...parameters);
			}

			return typeof handler === 'function' ? handler(value) : (value as any)[handler]();
		},
		register(constructor: Constructor, handler?: string | GenericCallback) {
			handlers.register(constructor, handler);
		},
	};
}

function isConstructable(value: unknown): boolean {
	return typeof value === 'object' && value !== null;
}
