import type { Timer } from './timer';
import type { When } from './when';
/**
 * Is the value a repeating timer?
 */
export declare function isRepeated(value: unknown): value is Timer;
/**
 * Is the value a timer?
 */
export declare function isTimer(value: unknown): value is Timer;
/**
 * Is the value a waiting timer?
 */
export declare function isWaited(value: unknown): value is Timer;
/**
 * Is the value a conditional timer?
 */
export declare function isWhen(value: unknown): value is When;
