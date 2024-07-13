import type { GetterSetter } from '../models';
export declare function createProperty(store: Record<string, number>, key: string, min: number, max: number): GetterSetter<number>;
