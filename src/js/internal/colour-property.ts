import type {GetterSetter} from '../models';
import {clamp} from '../number';

export function createProperty(
	store: Record<string, number>,
	key: string,
	min: number,
	max: number,
): GetterSetter<number> {
	return {
		get() {
			return store[key];
		},
		set(value) {
			store[key] = clamp(value, min, max);
		},
	};
}
