import {getSizedMaximum} from '../internal/sized';

// #region Types and classes

/**
 * A _Map_ with a maximum size
 *
 * Behavior is similar to a _LRU_ cache, where the least recently used entries are removed
 */
export class SizedMap<SizedKey = unknown, SizedValue = unknown> extends Map<SizedKey, SizedValue> {
	/**
	 * The maximum size of the _Map_
	 */
	readonly #maximumSize: number;

	/**
	 * Is the _Map_ full?
	 */
	get full(): boolean {
		return super.size >= this.#maximumSize;
	}

	get maximum(): number {
		return this.#maximumSize;
	}

	/**
	 * Create a new _SizedMap_ with entries and a maximum size _(2^20)_
	 *
	 * @param entries Array of key-value pairs to initialize the _SizedMap_ with
	 * @template SizedKey Type of the keys in the _SizedMap_
	 * @template SizedValue Type of the values in the _SizedMap_
	 */
	constructor(entries: [SizedKey, SizedValue][]);

	/**
	 * Create a new _SizedMap_ with a maximum size _(but clamped at 2^24)_
	 *
	 * @param maximum Maximum size of the _SizedMap_
	 * @template SizedKey Type of the keys in the _SizedMap_
	 * @template SizedValue Type of the values in the _SizedMap_
	 */
	constructor(maximum: number);

	/**
	 * Create a new _SizedMap_ with _(optional)_ entries and a maximum size
	 *
	 * @param entries Array of key-value pairs to initialize the _SizedMap_ with
	 * @param maximum Maximum size of the _SizedMap_ _(defaults to 2^20; clamped at 2^24)_
	 * @template SizedKey Type of the keys in the _SizedMap_
	 * @template SizedValue Type of the values in the _SizedMap_
	 */
	constructor(entries?: [SizedKey, SizedValue][], maximum?: number);

	constructor(first?: [SizedKey, SizedValue][] | number, second?: number) {
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
	override get(key: SizedKey): SizedValue | undefined {
		if (super.has(key)) {
			const value = super.get(key) as SizedValue;

			this.#setValue(key, value, true);

			return value;
		}
	}

	/**
	 * @inheritdoc
	 */
	override set(key: SizedKey, value: SizedValue): this {
		return this.#setValue(key, value, super.has(key));
	}

	#setValue(key: SizedKey, value: SizedValue, has: boolean): this {
		if (has) {
			super.delete(key);
		} else if (super.size >= this.#maximumSize) {
			super.delete(super.keys().next().value as SizedKey);
		}

		super.set(key, value);

		return this;
	}
}

// #endregion
