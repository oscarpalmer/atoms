import {clamp} from './number';

/**
 * A Map with a maximum size
 * - Maximum size defaults to _2^20_; any provided size will be clamped at _2^24_
 * - Behaviour is similar to a _LRU_-cache, where the least recently used entries are removed
 */
export class SizedMap<Key = unknown, Value = unknown> extends Map<Key, Value> {
	private readonly maximumSize: number;

	/**
	 * Is the Map full?
	 */
	get full() {
		return this.size >= this.maximumSize;
	}

	/**
	 * The maximum size of the Map
	 */
	get maximum() {
		return this.maximumSize;
	}

	/**
	 * Create a new Map with entries and a maximum size _(2^20)_
	 */
	constructor(entries: Array<[Key, Value]>);

	/**
	 * Create a new Map with a maximum size _(but clamped at 2^24)_
	 */
	constructor(maximum: number);

	/**
	 * Create a new Map with _(optional)_ entries and a maximum size _(defaults to 2^20; clamped at 2^24)_
	 */
	constructor(entries?: Array<[Key, Value]>, maximum?: number);

	constructor(first?: Array<[Key, Value]> | number, second?: number) {
		const maximumSize = getMaximum(first, second);

		super();

		this.maximumSize = maximumSize;

		if (Array.isArray(first)) {
			const {length} = first;

			if (length <= maximumSize) {
				for (let index = 0; index < length; index += 1) {
					this.set(...first[index]);
				}
			} else {
				for (let index = 0; index < maximumSize; index += 1) {
					this.set(...first[length - maximumSize + index]);
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
		} else if (this.size >= this.maximumSize) {
			this.delete(this.keys().next().value as Key);
		}

		return super.set(key, value);
	}
}

/**
 * A Set with a maximum size
 * - Maximum size defaults to _2^20_; any provided size will be clamped at _2^24_
 * - Behaviour is similar to a _LRU_-cache, where the oldest values are removed
 */
export class SizedSet<Value = unknown> extends Set<Value> {
	private readonly maximumSize: number;

	/**
	 * Is the Set full?
	 */
	get full() {
		return this.size >= this.maximumSize;
	}

	/**
	 * The maximum size of the Set
	 */
	get maximum() {
		return this.maximumSize;
	}

	/**
	 * Create a new Set with values and a maximum size _(2^20)_
	 */
	constructor(values: Value[]);

	/**
	 * Create a new Set with a maximum size _(but clamped at 2^24)_
	 */
	constructor(maximum: number);

	/**
	 * Create a new Set with _(optional)_ values and a maximum size _(defaults to 2^20; clamped at 2^24)_
	 */
	constructor(values?: Value[], maximum?: number);

	constructor(first?: Value[] | number, second?: number) {
		const maximumSize = getMaximum(first, second);

		super();

		this.maximumSize = maximumSize;

		if (Array.isArray(first)) {
			const {length} = first;

			if (length <= maximumSize) {
				for (let index = 0; index < length; index += 1) {
					this.add(first[index]);
				}
			} else {
				for (let index = 0; index < maximumSize; index += 1) {
					this.add(first[length - maximumSize + index]);
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
		} else if (this.size >= this.maximumSize) {
			this.delete(this.values().next().value as Value);
		}

		return super.add(value);
	}

	/**
	 * Get a value from the Set, if it exists _(and move it to the end)_
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
	const actual =
		(typeof first === 'number'
			? first
			: typeof second === 'number'
				? second
				: undefined) ?? 2 ** 20;

	return clamp(actual, 1, 2 ** 24);
}
