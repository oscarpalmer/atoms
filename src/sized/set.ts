import {getSizedMaximum} from '../internal/sized';

// #region Types

/**
 * A _Set_ with a maximum size
 *
 * Behavior is similar to a _LRU_ cache, where the oldest values are removed
 */
export class SizedSet<Value = unknown> extends Set<Value> {
	/**
	 * The maximum size of the _Set_
	 */
	readonly #maximumSize: number;

	/**
	 * Is the _Set_ full?
	 */
	get full(): boolean {
		return this.size >= this.#maximumSize;
	}

	get maximum(): number {
		return this.#maximumSize;
	}

	/**
	 * Create a new _SizedSet_ with values and a maximum size _(2^20)_
	 *
	 * @param values Array of values to initialize the _SizedSet_ with
	 * @template Value Type of the values in the _SizedSet_
	 */
	constructor(values: Value[]);

	/**
	 * Create a new _SizedSet_ with a maximum size _(but clamped at 2^24)_
	 *
	 * @param maximum Maximum size of the _SizedSet_ _(defaults to 2^20; clamped at 2^24)_
	 * @template Value Type of the values in the _SizedSet_
	 */
	constructor(maximum: number);

	/**
	 * Create a new _SizedSet_ with _(optional)_ values and a maximum size
	 *
	 * @param values Array of values to initialize the _SizedSet_ with
	 * @param maximum Maximum size of the _SizedSet_ _(defaults to 2^20; clamped at 2^24)_
	 * @template Value Type of the values in the _SizedSet_
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
		if (super.has(value)) {
			super.delete(value);
		} else if (this.size >= this.#maximumSize) {
			super.delete(this.values().next().value as Value);
		}

		return super.add(value);
	}

	/**
	 * Get a value from the _SizedSet_, if it exists _(and optionally move it to the end)_
	 *
	 * @param value Value to get from the _SizedSet_
	 * @param update Update the value's position in the _SizedSet_? _(defaults to `false`)_
	 * @returns Found value if it exists, otherwise `undefined`
	 */
	get(value: Value, update?: boolean): Value | undefined {
		if (super.has(value)) {
			if (update ?? false) {
				super.delete(value);

				this.add(value);
			}

			return value;
		}
	}
}

// #endregion
