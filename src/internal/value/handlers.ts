import type {Constructor, GenericCallback} from '../../models';
import {isNonConstructor} from '../is';

// #region Types

type BaseHandler = {
	handlers: WeakMap<Constructor, string | GenericCallback>;
	options: BaseHandlerOptions;
	owner: GenericCallback;
	deregister: (constructor: Constructor) => void;
	get: (first: unknown, second: unknown) => string | GenericCallback | undefined;
	register: (constructor: Constructor, handler?: string | GenericCallback) => void;
};

type BaseHandlerOptions = {
	callback: GenericCallback;
	method?: string;
};

type CompareHandler<Value> = {
	base: BaseHandler;
	handle(first: unknown, second: unknown, ...parameters: unknown[]): Value;
};

type ValueHandler = {
	base: BaseHandler;
	handle(value: unknown, ...parameters: unknown[]): unknown;
};

// #endregion

// #region Instances

function BaseHandler(this: any, owner: GenericCallback, options: BaseHandlerOptions) {
	this.handlers = new WeakMap<Constructor, string | GenericCallback>();
	this.owner = owner;
	this.options = options;
}

Object.defineProperties(BaseHandler.prototype, {
	deregister: {
		value: deregisterHandler,
	},
	get: {
		value: getHandler,
	},
	register: {
		value: registerHandler,
	},
});

function CompareHandler(this: any, base: BaseHandler) {
	this.base = base;
}

Object.defineProperties(CompareHandler.prototype, {
	handle: {
		value: handleComparison,
	},
});

function ValueHandler(this: any, value: BaseHandler) {
	this.base = value;
}

Object.defineProperties(ValueHandler.prototype, {
	handle: {
		value: handleValue,
	},
});

// #endregion

// #region Functions

function createBaseHandler(owner: GenericCallback, options: BaseHandlerOptions) {
	// @ts-expect-error All good, no worries :-)
	return new BaseHandler(owner, options);
}

export function createCompareHandler<Value>(
	owner: GenericCallback,
	options: BaseHandlerOptions,
): CompareHandler<Value> {
	// @ts-expect-error All good, no worries :-)
	return new CompareHandler(createBaseHandler(owner, options));
}

export function createValueHandler(
	owner: GenericCallback,
	options: BaseHandlerOptions,
): ValueHandler {
	// @ts-expect-error All good, no worries :-)
	return new ValueHandler(createBaseHandler(owner, options));
}

function deregisterHandler(this: BaseHandler, value: unknown) {
	this.handlers.delete(value as never);
}

function getHandler(
	this: BaseHandler,
	first: unknown,
	second: unknown,
): string | GenericCallback | undefined {
	if (
		isConstructable(first) &&
		isConstructable(second) &&
		(first as object).constructor === (second as object).constructor
	) {
		return this.handlers.get((first as object).constructor as Constructor);
	}

	return undefined;
}

function handleComparison(
	this: CompareHandler<unknown>,
	first: unknown,
	second: unknown,
	...parameters: unknown[]
): unknown {
	const handler = this.base.get(first, second);

	if (handler == null) {
		return this.base.options.callback(first, second, ...parameters);
	}

	return typeof handler === 'function' ? handler(first, second) : (first as any)[handler](second);
}

function isConstructable(value: unknown): boolean {
	return typeof value === 'object' && value !== null;
}

function registerHandler(
	this: BaseHandler,
	constructor: Constructor,
	handler?: string | GenericCallback,
) {
	if (isNonConstructor(constructor) || handler === this.owner) {
		return;
	}

	let actual: string | GenericCallback | undefined = handler ?? this.options.method;

	if (typeof actual !== 'function' && typeof actual !== 'string') {
		return;
	}

	if (typeof actual === 'string') {
		actual = typeof constructor.prototype[actual] === 'function' ? actual : undefined;
	}

	if (actual != null) {
		this.handlers.set(constructor, actual);
	}
}

function handleValue(this: ValueHandler, value: unknown, ...parameters: unknown[]): unknown {
	const handler = this.base.get(value, value);

	if (handler == null) {
		return this.base.options.callback(value, ...parameters);
	}

	return typeof handler === 'function' ? handler(value) : (value as any)[handler]();
}

// #endregion
