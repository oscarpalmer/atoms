import type { BooleanCallback, FindType, KeyCallback } from '../array/models';
import type { Key } from '../models';
export declare function findValue<Model, Value = Model>(type: FindType, array: Model[], value: Value | BooleanCallback<Model>, key?: Key | KeyCallback<Model>): unknown;
export declare function findValues<Model, Value = Model>(type: 'all' | 'unique', array: Model[], value: Value | BooleanCallback<Model>, key?: Key | KeyCallback<Model>): Model[];
