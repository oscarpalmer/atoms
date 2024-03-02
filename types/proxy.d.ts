import { ArrayOrPlainObject, PlainObject } from './is';
declare class Manager<T extends ArrayOrPlainObject = PlainObject> {
    readonly owner: Proxied<T>;
    constructor(owner: Proxied<T>);
    clone(): Proxied<T>;
}
export type Proxied<T extends ArrayOrPlainObject = PlainObject> = {
    $: Manager<T>;
} & T;
export declare function proxy<T extends PlainObject>(value: T): Proxied<T>;
export {};
