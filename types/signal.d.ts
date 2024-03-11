type InternalEffect = {
    _active: boolean;
    _callback: () => void;
    _reactives: Set<InternalReactive>;
};
type InternalReactive = {
    _active: boolean;
    _effects: Set<InternalEffect>;
    _value: unknown;
};
/**
 * The base class for reactive values
 */
declare abstract class Reactive<T = unknown> {
    protected _active: boolean;
    protected _effects: Set<InternalEffect>;
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
declare class Computed<T> extends Reactive<T> {
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
    private readonly _reactives;
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
declare class Signal<T> extends Reactive<T> {
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
 * Is the value a computed, reactive value?
 */
export declare function isComputed(value: unknown): value is Computed<unknown>;
/**
 * Is the value a reactive effect?
 */
export declare function isEffect(value: unknown): value is Effect;
/**
 * Is the value a reactive value?
 */
export declare function isReactive(value: unknown): value is Reactive<unknown>;
/**
 * Is the value a reactive value?
 */
export declare function isSignal(value: unknown): value is Signal<unknown>;
/**
 * Creates a reactive value
 */
export declare function signal<T>(value: T): Signal<T>;
export type { Computed, Effect, Reactive, Signal };
