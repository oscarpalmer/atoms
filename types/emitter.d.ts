export type Emitter<Value> = {
    /**
     * Is the emitter active?
     */
    readonly active: boolean;
    /**
     * The observable that can be subscribed to
     */
    readonly observable: Observable<Value>;
    /**
     * The current value
     */
    readonly value: Value;
    /**
     * Destroys the emitter
     */
    destroy(): void;
    /**
     * Emits a new value _(and optionally finishes the emitter)_
     */
    emit(value: Value, finish?: boolean): void;
    /**
     * Emits an error _(and optionally finishes the emitter)_
     */
    error(error: Error, finish?: boolean): void;
    /**
     * Finishes the emitter
     */
    finish(): void;
};
export type Observable<Value> = {
    /**
     * Subscribes to value changes
     */
    subscribe(observer: Observer<Value>): Subscription;
    /**
     * Subscribes to value changes
     */
    subscribe(onNext: (value: Value) => void, onError?: (error: Error) => void, onComplete?: () => void): Subscription;
};
export type Observer<Value> = {
    /**
     * Callback for when the observable is complete
     */
    complete?: () => void;
    /**
     * Callback for when the observable has an error
     */
    error?: (error: Error) => void;
    /**
     * Callback for when the observable has a new value
     */
    next?: (value: Value) => void;
};
export type Subscription = {
    /**
     * Is the subscription closed?
     */
    readonly closed: boolean;
    /**
     * Unsubscribes from the observable
     */
    unsubscribe(): void;
};
/**
 * Creates a new emitter
 */
export declare function emitter<Value>(value: Value): Emitter<Value>;
