import type { Timer } from './timer';
/**
 * A set of all active timers
 */
export declare const activeTimers: Set<Timer>;
/**
 * A set of timers that were paused due to the document being hidden
 */
export declare const hiddenTimers: Set<Timer>;
/**
 * Milliseconds in a frame, probably ;-)
 */
export declare const milliseconds: number;
