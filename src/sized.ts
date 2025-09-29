import {clamp} from './internal/number';

/**
 * A Map with a maximum size
 *
 * Behaviour is similar to a _LRU_-cache, where the least recently used entries are removed
 */
export class SizedMap<Key = unknown, Value = unknown> extends Map<Key, Value> {
	/**
	 * The maximum size of the Map
	 */
	readonly #maximumSize: number;

	/**
	 * Is the Map full?
	 */
	get full(): boolean {
		return this.size >= this.#maximumSize;
	}

	get maximum(): number {
		return this.#maximumSize;
	}

	/**
	 * Create a new SizedMap with entries and a maximum size _(2^20)_
	 * @param entries Array of key-value pairs to initialize the SizedMap with
	 * @template Key Type of the keys in the SizedMap
	 * @template Value Type of the values in the SizedMap
	 */
	constructor(entries: [Key, Value][]);

	/**
	 * Create a new SizedMap with a maximum size _(but clamped at 2^24)_
	 * @param maximum Maximum size of the SizedMap
	 * @template Key Type of the keys in the SizedMap
	 * @template Value Type of the values in the SizedMap
	 */
	constructor(maximum: number);

	/**
	 * Create a new SizedMap with _(optional)_ entries and a maximum size _(defaults to 2^20; clamped at 2^24)_
	 * @param entries Array of key-value pairs to initialize the SizedMap with
	 * @param maximum Maximum size of the SizedMap
	 * @template Key Type of the keys in the SizedMap
	 * @template Value Type of the values in the SizedMap
	 */
	constructor(entries?: [Key, Value][], maximum?: number);

	constructor(first?: [Key, Value][] | number, second?: number) {
		const maximum = getMaximum(first, second);

		super();

		this.#maximumSize = maximum;

		if (Array.isArray(first)) {
			const {length} = first;

			if (length <= maximum) {
				for (let index = 0; index < length; index += 1) {
					this.set(...first[index]);
				}
			} else {
				for (let index = 0; index < maximum; index += 1) {
					this.set(...first[length - maximum + index]);
				}
			}
		}
	}

	/**
	 * @inheritdoc
	 */
	get(key: Key): Value | undefined {
		const value = super.get(key);

		if (value !== undefined || this.has(key)) {
			this.set(key, value as Value);
		}

		return value;
	}

	/**
	 * @inheritdoc
	 */
	set(key: Key, value: Value): this {
		if (this.has(key)) {
			this.delete(key);
		} else if (this.size >= this.#maximumSize) {
			this.delete(this.keys().next().value as Key);
		}

		return super.set(key, value);
	}
}

/**
 * - A Set with a maximum size
 * - Behaviour is similar to a _LRU_-cache, where the oldest values are removed
 */
export class SizedSet<Value = unknown> extends Set<Value> {
	/**
	 * The maximum size of the Set
	 */
	readonly #maximumSize: number;

	/**
	 * Is the Set full?
	 */
	get full(): boolean {
		return this.size >= this.#maximumSize;
	}

	get maximum(): number {
		return this.#maximumSize;
	}

	/**
	 * Create a new SizedSet with values and a maximum size _(2^20)_
	 * @param values Array of values to initialize the SizedSet with
	 * @template Value Type of the values in the SizedSet
	 */
	constructor(values: Value[]);

	/**
	 * Create a new SizedSet with a maximum size _(but clamped at 2^24)_
	 * @param maximum Maximum size of the SizedSet
	 * @template Value Type of the values in the SizedSet
	 */
	constructor(maximum: number);

	/**
	 * Create a new SizedSet with _(optional)_ values and a maximum size _(defaults to 2^20; clamped at 2^24)_
	 * @param values Array of values to initialize the SizedSet with
	 * @param maximum Maximum size of the SizedSet
	 * @template Value Type of the values in the SizedSet
	 */
	constructor(values?: Value[], maximum?: number);

	constructor(first?: Value[] | number, second?: number) {
		const maximum = getMaximum(first, second);

		super();

		this.#maximumSize = maximum;

		if (Array.isArray(first)) {
			const {length} = first;

			if (length <= maximum) {
				for (let index = 0; index < length; index += 1) {
					this.add(first[index]);
				}
			} else {
				for (let index = 0; index < maximum; index += 1) {
					this.add(first[length - maximum + index]);
				}
			}
		}
	}

	/**
	 * @inheritdoc
	 */
	add(value: Value): this {
		if (this.has(value)) {
			this.delete(value);
		} else if (this.size >= this.#maximumSize) {
			this.delete(this.values().next().value as Value);
		}

		return super.add(value);
	}

	/**
	 * Get a value from the SizedSet, if it exists _(and move it to the end)_
	 * @param value Value to get from the SizedSet
	 * @param update Update the value's position in the SizedSet? _(defaults to `false`)_
	 * @returns The value if it exists, otherwise `undefined`
	 */
	get(value: Value, update?: boolean): Value | undefined {
		if (this.has(value)) {
			if (update ?? false) {
				this.delete(value);
				this.add(value);
			}

			return value;
		}
	}
}

function getMaximum(first?: unknown, second?: unknown): number {
	let actual: number;

	if (typeof first === 'number') {
		actual = first;
	} else {
		actual = typeof second === 'number' ? second : MAXIMUM_DEFAULT;
	}

	return clamp(actual, 1, MAXIMUM_ABSOLUTE);
}

//

const MAXIMUM_ABSOLUTE = 16_777_216;

const MAXIMUM_DEFAULT = 1_048_576;
