import type {Simplify} from 'type-fest';
import type {PlainObject} from './models';

type FindKey<Model, Value> = {
	[Key in keyof Model]: Model[Key] extends Value ? Key : never;
}[keyof Model];

type Inferred<Model extends Schema> = {
	[Key in keyof Model]: Model[Key] extends keyof Values
		? Values[Model[Key]]
		: never;
};

type ReverseInferred<Model extends Typed> = {
	[Key in keyof Model]: Model[Key] extends Values[keyof Values]
		? FindKey<Values, Model[Key]>
		: never;
};

export type Schema = Record<string, keyof Values>;

export type Schematic<Model> = {
	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model;
};

type Typed = Record<string, unknown>;

type Values = {
	array: unknown[];
	bigint: bigint;
	boolean: boolean;
	date: Date;
	// biome-ignore lint/complexity/noBannedTypes: it's the most basic value type, so I think it's ok
	function: Function;
	number: number;
	object: object;
	string: string;
	symbol: symbol;
};

function getKeys(value: unknown): string[] {
	return value && typeof value === 'object' ? Object.keys(value) : [];
}

/**
 * Create a schematic from a typed schema
 */
export function schematic<Model extends Typed>(
	schema: ReverseInferred<Model>,
): Schematic<Model>;

/**
 * Create a schematic from a schema
 */
export function schematic<Model extends Schema>(
	schema: Model,
): Schematic<Simplify<Inferred<Model>>>;

export function schematic<Model extends Schema>(schema: Model) {
	const keys = getKeys(schema);
	const {length} = keys;

	const canValidate = length > 0;

	return Object.freeze({
		is: (value: unknown) =>
			canValidate && validate(schema, keys, length, value),
	});
}

function validate(
	schema: Schema,
	keys: string[],
	length: number,
	value: unknown,
): boolean {
	if (getKeys(value).length !== length) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!validators[schema[key]]((value as PlainObject)[key])) {
			return false;
		}
	}

	return true;
}

const validators: Record<keyof Values, (value: unknown) => boolean> = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	function: value => typeof value === 'function',
	number: value => typeof value === 'number',
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
};
