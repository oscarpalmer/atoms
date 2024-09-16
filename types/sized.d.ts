/**
 * A Map with a maximum size
 * - Maximum size defaults to _2^20_; any provided size will be clamped at _2^24_
 * - Behaviour is similar to a _LRU_-cache, where the least recently used entries are removed
 */
export declare class SizedMap<Key = unknown, Value = unknown> extends Map<Key, Value> {
    private readonly maximumSize;
    /**
     * Is the Map full?
     */
    get full(): boolean;
    /**
     * The maximum size of the Map
     */
    get maximum(): number;
    /**
     * Creates a new Map with entries and a maximum size _(2^20)_
     */
    constructor(entries: Array<[Key, Value]>);
    /**
     * Creates a new Map with a maximum size _(but clamped at 2^24)_
     */
    constructor(maximum: number);
    /**
     * Creates a new Map with _(optional)_ entries and a maximum size _(defaults to 2^20; clamped at 2^24)_
     */
    constructor(entries?: Array<[Key, Value]>, maximum?: number);
    /**
     * @inheritdoc
     */
    get(key: Key): Value | undefined;
    /**
     * @inheritdoc
     */
    set(key: Key, value: Value): this;
}
/**
 * A Set with a maximum size
 * - Maximum size defaults to _2^20_; any provided size will be clamped at _2^24_
 * - Behaviour is similar to a _LRU_-cache, where the oldest values are removed
 */
export declare class SizedSet<Value = unknown> extends Set<Value> {
    private readonly maximumSize;
    /**
     * Is the Set full?
     */
    get full(): boolean;
    /**
     * The maximum size of the Set
     */
    get maximum(): number;
    /**
     * Creates a new Set with values and a maximum size _(2^20)_
     */
    constructor(values: Value[]);
    /**
     * Creates a new Set with a maximum size _(but clamped at 2^24)_
     */
    constructor(maximum: number);
    /**
     * Creates a new Set with _(optional)_ values and a maximum size _(defaults to 2^20; clamped at 2^24)_
     */
    constructor(values?: Value[], maximum?: number);
    /**
     * @inheritdoc
     */
    add(value: Value): this;
    /**
     * Get a value from an index in the Set, if it exists
     * - Negative indices are counted from the end
     * - Optionally move the value to the end with `update`
     */
    at(index: number, update?: boolean): Value | undefined;
    /**
     * Get a value from the Set, if it exists _(and move it to the end)_
     */
    get(value: Value, update?: boolean): Value | undefined;
}
