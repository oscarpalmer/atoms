type Effect = () => void;
declare class Computed<T> {
    get value(): T;
    constructor(callback: () => T);
}
declare class Signal<T> {
    get value(): T;
    set value(value: T);
    constructor(value: T);
}
export declare function computed<T>(callback: () => T): Computed<T>;
export declare function effect(callback: Effect): void;
export declare function signal<T>(value: T): Signal<T>;
export {};
