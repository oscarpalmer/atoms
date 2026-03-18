import type {PlainObject} from '../../models';

export function partial<Value extends object, ValueKey extends keyof Value>(
	value: unknown,
	keys: ValueKey[],
	omit: true,
): Omit<Value, ValueKey>;

export function partial<Value extends object, ValueKey extends keyof Value>(
	value: unknown,
	keys: ValueKey[],
	omit: false,
): Pick<Value, ValueKey>;

export function partial<Value extends object, ValueKey extends keyof Value>(
	value: unknown,
	providedKeys: ValueKey[],
	omit: boolean,
): Partial<Value> {
	if (typeof value !== 'object' || value === null) {
		return {} as Partial<Value>;
	}

	const keys = omit ? Object.keys(value) : Array.isArray(providedKeys) ? providedKeys : [];
	const {length} = keys;

	if (length === 0) {
		return omit ? (value as Partial<Value>) : ({} as Partial<Value>);
	}

	const partials: Partial<Value> = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!(key in value)) {
			continue;
		}

		if (omit ? !providedKeys.includes(key as ValueKey) : true) {
			(partials as PlainObject)[key] = (value as PlainObject)[key];
		}
	}

	return partials;
}
