import {getSizedMaximum} from '../internal/sized';

// #region Types and classes

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
		const maximum = getSizedMaximum(first, second);

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
	override get(key: Key): Value | undefined {
		const value = super.get(key);

		if (value !== undefined || this.has(key)) {
			this.set(key, value as Value);
		}

		return value;
	}

	/**
	 * @inheritdoc
	 */
	override set(key: Key, value: Value): this {
		if (this.has(key)) {
			this.delete(key);
		} else if (this.size >= this.#maximumSize) {
			this.delete(this.keys().next().value as Key);
		}

		return super.set(key, value);
	}
}

// #endregion
