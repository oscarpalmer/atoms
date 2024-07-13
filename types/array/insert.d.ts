import type { InsertType } from './models';
/**
 * - Inserts values into an array at a specified index
 * - Uses chunking to avoid stack overflow
 */
export declare function insert<Value>(array: Value[], index: number, values: Value[]): void;
export declare function insertValues<Value>(type: InsertType, array: Value[], values: Value[], start: number, deleteCount: number): unknown;
