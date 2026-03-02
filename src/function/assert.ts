import type {Constructor} from '../models';

export type Asserter<Value> = (value: unknown) => asserts value is Value;

export function assert<Condition extends () => boolean>(
	condition: Condition,
	message: string,
	error?: ErrorConstructor,
): asserts condition {
	if (!condition()) {
		throw new (error ?? Error)(message);
	}
}

assert.condition = <Value>(
	condition: (value: unknown) => boolean,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> => {
	return value => {
		assert(() => condition(value), message, error);
	};
};

assert.instanceOf = <Value>(
	constructor: Constructor<Value>,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> => {
	return value => {
		assert(() => value instanceof constructor, message, error);
	};
};

assert.is = <Value>(
	condition: (value: unknown) => value is Value,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> => {
	return value => {
		assert(() => condition(value), message, error);
	};
};
