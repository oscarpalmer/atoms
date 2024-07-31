import type {PlainObject} from '../models';
import type {Timer} from './timer';
import type {When} from './when';

function is(pattern: RegExp, value: unknown) {
	return pattern.test((value as PlainObject)?.$timer as string);
}

/**
 * Is the value a repeating timer?
 */
export function isRepeated(value: unknown): value is Timer {
	return is(/^repeat$/, value);
}

/**
 * Is the value a timer?
 */
export function isTimer(value: unknown): value is Timer {
	return is(/^repeat|wait$/, value);
}

/**
 * Is the value a waiting timer?
 */
export function isWaited(value: unknown): value is Timer {
	return is(/^wait$/, value);
}

/**
 * Is the value a conditional timer?
 */
export function isWhen(value: unknown): value is When {
	return is(/^when$/, value) && typeof (value as When).then === 'function';
}
