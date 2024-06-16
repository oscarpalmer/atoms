export type Emitter<Value> = {
    readonly active: boolean;
    readonly obserable: Observable<Value>;
    readonly value: Value;
    destroy(): void;
    emit(value: Value): void;
    error(error: Error): void;
    finish(): void;
};
export type Observable<Value> = {
    subscribe(observer: Observer<Value>): Subscription;
    subscribe(onNext: (value: Value) => void, onError?: (error: Error) => void, onComplete?: () => void): Subscription;
};
export type Observer<Value> = {
    complete?: () => void;
    error?: (error: Error) => void;
    next?: (value: Value) => void;
};
export type Subscription = {
    closed: boolean;
    unsubscribe(): void;
};
export declare function emitter<Value>(value: Value): Emitter<Value>;
