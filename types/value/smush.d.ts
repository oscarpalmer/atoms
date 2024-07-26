import type { Get, Paths, Simplify } from 'type-fest';
import type { PlainObject, ToString } from '../models';
type Smushed<Value> = Simplify<{
    [Key in Paths<Value>]: Get<Value, ToString<Key>>;
}>;
/**
 * Smushes an object into a flat object with dot notation keys
 */
export declare function smush<Value extends PlainObject>(value: Value): Smushed<Value>;
export {};
