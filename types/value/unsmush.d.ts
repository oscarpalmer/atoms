import type { KeysOfUnion, Simplify } from 'type-fest';
import type { PlainObject } from '../models';
type Unsmushed<Value extends PlainObject> = Simplify<Omit<{
    [Key in KeysOfUnion<Value>]: Value[Key];
}, `${string}.${string}`>>;
/**
 * Unsmushes a smushed object _(turning dot notation keys into nested keys)_
 */
export declare function unsmush<Value extends PlainObject>(value: Value): Unsmushed<Value>;
export {};
