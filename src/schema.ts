import type {
	OptionalKeysOf,
	RequiredKeysOf,
	Simplify,
	UnionToTuple,
} from 'type-fest';
import type {PlainObject} from './models';

type GetKey<Value> = {
	[Key in keyof Values]: Value extends Values[Key] ? Key : never;
}[keyof Values];

type GetTypes<Value extends unknown[]> = Value extends [infer Single]
	? Single
	: Value;

type GetType<Value> = GetTypes<UnionToTuple<GetKey<Value>>>;

type InferProperty<Value> = Value extends Property
	? Value['type'] extends keyof Values
		? Values[Value['type']]
		: Value['type'] extends (keyof Values)[]
			? Values[Value['type'][number]]
			: never
	: never;

type InferValue<Value> = Value extends keyof Values
	? Values[Value]
	: Value extends (keyof Values)[]
		? Values[Value[number]]
		: never;

type Inferred<Model extends Schema> = {
	[Key in InferredRequiredProperties<Model>]: Model[Key] extends Property
		? InferProperty<Model[Key]>
		: InferValue<Model[Key]>;
} & {
	[Key in InferredOptionalProperties<Model>]?: Model[Key] extends Property
		? InferProperty<Model[Key]>
		: never;
};

type InferredOptionalProperties<Model extends Schema> = {
	[Key in keyof Model]: Model[Key] extends Property
		? Model[Key]['required'] extends false
			? Key
			: never
		: never;
}[keyof Model];

type InferredRequiredProperties<Model extends Schema> = {
	[Key in keyof Model]: Model[Key] extends Property
		? Model[Key]['required'] extends false
			? never
			: Key
		: Key;
}[keyof Model];

type OptionalProperty<Type> = {
	required: false;
	type: GetType<Type>;
};

type Property = {
	required?: boolean;
	type: keyof Values | (keyof Values)[];
};

type RequiredProperty<Type> = {
	required: true;
	type: GetType<Type>;
};

/**
 * A schema for validating objects
 */
export type Schema = Record<string, keyof Values | (keyof Values)[] | Property>;

/**
 * A schematic for validating objects
 */
export type Schematic<Model> = {
	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model;
};

type Typed = Record<string, unknown>;

/**
 * A typed schema for validating objects
 */
export type TypedSchema<Model extends Typed> = Simplify<
	{
		[Key in RequiredKeysOf<Model>]:
			| GetType<Model[Key]>
			| RequiredProperty<Model[Key]>;
	} & {
		[Key in OptionalKeysOf<Model>]: OptionalProperty<Model[Key]>;
	}
>;

type ValidatedProperty = {
	required: boolean;
	types: (keyof Values)[];
};

type ValidatedSchema = {
	keys: string[];
	length: number;
	properties: Record<string, ValidatedProperty>;
};

type Values = {
	array: unknown[];
	bigint: bigint;
	boolean: boolean;
	date: Date;
	// biome-ignore lint/complexity/noBannedTypes: it's the most basic value type, so I think it's ok
	function: Function;
	null: null;
	number: number;
	object: object;
	string: string;
	symbol: symbol;
	undefined: undefined;
};

//

const types = new Set<keyof Values>([
	'array',
	'bigint',
	'boolean',
	'date',
	'function',
	'null',
	'number',
	'object',
	'string',
	'symbol',
	'undefined',
]);

const validators: Record<keyof Values, (value: unknown) => boolean> = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number',
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};

//

function getTypes(value: unknown): (keyof Values)[] {
	return (Array.isArray(value) ? value : [value]).filter(item =>
		types.has(item),
	);
}

function getValidatedSchema(schema: unknown): ValidatedSchema {
	const validated: ValidatedSchema = {
		keys: [],
		length: 0,
		properties: {},
	};

	if (typeof schema !== 'object' || schema === null) {
		return validated;
	}

	const keys = Object.keys(schema);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = (schema as Schema)[key];

		let required = true;
		let valueTypes: (keyof Values)[];

		if (Array.isArray(value)) {
			valueTypes = getTypes(value);
		} else if (typeof value === 'object' && value !== null) {
			if (typeof (value as PlainObject).required === 'boolean') {
				required = (value as PlainObject).required as boolean;
			}

			valueTypes = getTypes((value as PlainObject).type);
		} else {
			valueTypes = getTypes(value);
		}

		if (valueTypes.length > 0) {
			if (!required && !valueTypes.includes('undefined')) {
				valueTypes.push('undefined');
			}

			validated.keys.push(key);

			validated.properties[key] = {
				required,
				types: valueTypes,
			};

			validated.length += 1;
		}
	}

	return validated;
}

/**
 * Create a schematic from a typed schema
 */
export function schematic<Model extends Typed>(
		schema: TypedSchema<Model>,
	): Schematic<Model>;

/**
 * Create a schematic from a schema
 */
export function schematic<Model extends Schema>(
		schema: Model,
	): Schematic<Inferred<Model>>;

export function schematic<Model extends Schema>(schema: Model) {
	const validated = getValidatedSchema(schema);

	const canValidate = validated.length > 0;

	return Object.freeze({
		is: (value: unknown) => canValidate && validate(validated, value),
	});
}

function validate(validated: ValidatedSchema, obj: unknown): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	outer: for (let index = 0; index < validated.length; index += 1) {
		const key = validated.keys[index];
		const property = validated.properties[key];
		const value = (obj as PlainObject)[key];

		if (
			value === undefined &&
			property.required &&
			!property.types.includes('undefined')
		) {
			return false;
		}

		const typesLength = property.types.length;

		if (typesLength === 1) {
			if (!validators[property.types[0]](value)) {
				return false;
			}

			continue;
		}

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			if (validators[property.types[typeIndex]](value)) {
				continue outer;
			}
		}

		return false;
	}

	return true;
}
