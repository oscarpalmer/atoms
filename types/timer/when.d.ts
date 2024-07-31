import type { WhenOptions, WhenState } from './models';
import { BasicTimer } from './timer';
export declare class When extends BasicTimer<WhenState> {
    get active(): boolean;
    get paused(): boolean;
    constructor(state: WhenState);
    /**
     * Continues the timer _(if it was paused)_
     */
    continue(): When;
    /**
     * Pauses the timer _(if it was running)_
     */
    pause(): When;
    /**
     * Stops the timer _(if it was running)_
     */
    stop(): When;
    /**
     * Starts the timer and returns a promise that resolves when the condition is met
     */
    then(resolve?: (() => void) | null, reject?: (() => void) | null): Promise<void>;
}
/**
 * - Creates a promise that resolves when a condition is met
 * - If the condition is never met in a timely manner, the promise will reject
 */
export declare function when(condition: () => boolean, options?: Partial<WhenOptions>): When;
