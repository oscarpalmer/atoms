import type {Timer} from './timer';

/**
 * A set of all active timers
 */
export const activeTimers = new Set<Timer>();

/**
 * A set of timers that were paused due to the document being hidden
 */
export const hiddenTimers = new Set<Timer>();

/**
 * Milliseconds in a frame, probably ;-)
 */
export const milliseconds = 1_000 / 60;
