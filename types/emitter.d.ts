declare class Emitter<Value> {
    private readonly state;
    /**
     * Is the emitter active?
     */
    get active(): boolean;
    /**
     * The observable that can be subscribed to
     */
    get observable(): Observable<Value>;
    /**
     * The current value
     */
    get value(): Value;
    constructor(value: Value);
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
}
declare class Observable<Value> {
    private readonly state;
    constructor(emitter: Emitter<Value>, observers: Map<Subscription<Value>, Observer<Value>>);
    /**
     * Subscribes to value changes
     */
    subscribe(observer: Observer<Value>): Subscription<Value>;
    /**
     * Subscribes to value changes
     */
    subscribe(onNext: (value: Value) => void, onError?: (error: Error) => void, onComplete?: () => void): Subscription<Value>;
}
type ObservableState<Value> = {
    emitter: Emitter<Value>;
    observers: Map<Subscription<Value>, Observer<Value>>;
};
type Observer<Value> = {
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
declare class Subscription<Value> {
    private readonly state;
    constructor(state: ObservableState<Value>);
    /**
     * Is the subscription closed?
     */
    get closed(): boolean;
    destroy(): void;
    /**
     * Unsubscribes from the observable
     */
    unsubscribe(): void;
}
/**
 * Creates a new emitter
 */
export declare function emitter<Value>(value: Value): Emitter<Value>;
export type { Emitter, Observable, Observer, Subscription };
