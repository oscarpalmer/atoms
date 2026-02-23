import {getSizedMaximum} from '../internal/sized';

// #region Types and classes

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
		const maximum = getSizedMaximum(first, second);

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
	override add(value: Value): this {
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

// #endregion
