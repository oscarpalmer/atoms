import { ArrayOrObject, GenericObject } from './value';
declare class Manager<T extends ArrayOrObject = GenericObject> {
    readonly owner: Proxied<T>;
    constructor(owner: Proxied<T>);
    clone(): Proxied<T>;
}
export type Proxied<T extends ArrayOrObject = GenericObject> = {
    $: Manager<T>;
} & T;
export declare function proxy<T extends ArrayOrObject>(value: T): Proxied<T>;
export {};
