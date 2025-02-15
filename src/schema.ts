import type {Simplify} from 'type-fest';
import type {PlainObject} from './models';

type FindKey<Model, Value> = {
	[Key in keyof Model]: Model[Key] extends Value ? Key : never;
}[keyof Model];

type Inferred<Model extends Schema> = {
	[Key in keyof Model]: Model[Key] extends keyof Values
		? Values[Model[Key]]
		: Model[Key] extends (keyof Values)[]
			? Values[Model[Key][number]]
			: never;
};

type ReverseInferred<Model extends Typed> = {
	[Key in keyof Model]: Model[Key] extends Values[keyof Values]
		? FindKey<Values, Model[Key]>
		: FindKey<Values, Model[Key]>[];
};

export type Schema = Record<string, keyof Values | (keyof Values)[]>;

export type Schematic<Model> = {
	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model;
};

type Typed = Record<string, unknown>;

type ValidatedSchema = {
	keys: string[];
	length: number;
	schema: Record<string, (keyof Values)[]>;
};

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

const valueTypes = new Set<keyof Values>([
	'array',
	'bigint',
	'boolean',
	'date',
	'function',
	'number',
	'object',
	'string',
	'symbol',
]);

function getValidatedSchema(schema: unknown): ValidatedSchema {
	const validated: ValidatedSchema = {
		keys: [],
		length: 0,
		schema: {},
	};

	if (typeof schema !== 'object' || schema === null) {
		return validated;
	}

	const keys = Object.keys(schema);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = (schema as Schema)[key];

		const types: (keyof Values)[] = [];

		if (valueTypes.has(value as never)) {
			types.push(value as never);
		} else if (Array.isArray(value)) {
			const typesLength = value.length;

			for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
				const type = value[typeIndex];

				if (valueTypes.has(type)) {
					types.push(type);
				}
			}
		}

		if (types.length > 0) {
			validated.keys.push(key);

			validated.schema[key] = types;

			validated.length += 1;
		}
	}

	return validated;
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
	const validated = getValidatedSchema(schema);

	const canValidate = validated.length > 0;

	return Object.freeze({
		is: (value: unknown) => canValidate && validate(validated, value),
	});
}

function validate(validated: ValidatedSchema, value: unknown): boolean {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	outer: for (let index = 0; index < validated.length; index += 1) {
		const key = validated.keys[index];
		const types = validated.schema[key];
		const val = (value as PlainObject)[key];

		const typesLength = types.length;

		if (typesLength === 1) {
			if (!validators[types[0]](val)) {
				return false;
			}

			continue;
		}

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			if (validators[types[typeIndex]](val)) {
				continue outer;
			}
		}

		return false;
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
