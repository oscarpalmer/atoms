export {compare, registerComparator, unregisterComparator} from '../internal/value/compare';
export {
	equal,
	initializeEqualizer,
	registerEqualizer,
	unregisterEqualizer,
	type EqualOptions,
} from '../internal/value/equal';
export {getValue} from '../internal/value/get';
export {setValue} from '../internal/value/set';
export type {ArrayOrPlainObject, NestedPartial, PlainObject} from '../models';
export {clone} from './clone';
export {diff, type DiffOptions, type DiffResult, type DiffValue} from './diff';
export {merge, initializeMerger, type MergeOptions} from './merge';
export {partial} from './partial';
export {smush} from './smush';
export {unsmush} from './unsmush';
