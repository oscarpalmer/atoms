type InternalEffect = {
    _callback: () => void;
    _values: Set<InternalValue>;
};
type InternalValue = {
    _active: boolean;
    _effects: Set<InternalEffect>;
    _frame: number | undefined;
    _value: unknown;
};
declare abstract class Value<T = unknown> {
    protected _active: boolean;
    protected _effects: Set<InternalEffect>;
    protected _frame: number | undefined;
    protected _value: T;
    /**
     * The current value
     */
    abstract get value(): T;
    /**
     * The current value, returned without triggering computations or effects
     */
    peek(): T;
    /**
     * Allows reactivity for value, if it was stopped
     */
    abstract run(): void;
    /**
     * Stops reactivity for value, if it's running
     */
    abstract stop(): void;
    /**
     * Returns the JSON representation of the value
     */
    toJSON(): T;
    /**
     * Returns the string representation of the value
     */
    toString(): string;
}
/**
 * A computed, reactive value
 */
declare class Computed<T> extends Value<T> {
    private readonly _effect;
    /**
     * @inheritdoc
     */
    get value(): T;
    constructor(callback: () => T);
    /**
     * @inheritdoc
     */
    run(): void;
    /**
     * @inheritdoc
     */
    stop(): void;
}
/**
 * A reactive effect
 */
declare class Effect {
    private readonly _callback;
    private _active;
    private readonly _values;
    constructor(_callback: () => void);
    /**
     * Starts and runs the effect, if it was stopped
     */
    run(): void;
    /**
     * Stops the effect, if it's running
     */
    stop(): void;
}
/**
 * A reactive value
 */
declare class Signal<T> extends Value<T> {
    protected readonly _value: T;
    /**
     * @inheritdoc
     */
    get value(): T;
    /**
     * Sets the value
     */
    set value(value: T);
    constructor(_value: T);
    /**
     * @inheritdoc
     */
    run(): void;
    /**
     * @inheritdoc
     */
    stop(): void;
}
/**
 * Creates a computed, reactive value
 */
export declare function computed<T>(callback: () => T): Computed<T>;
/**
 * Creates a reactive effect
 */
export declare function effect(callback: () => void): Effect;
/**
 * Creates a reactive value
 */
export declare function signal<T>(value: T): Signal<T>;
export {};
