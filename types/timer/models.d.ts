import type { Timer } from './timer';
/**
 * Callback that runs after the timer has finished (or is stopped)
 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
 */
export type AfterCallback = (finished: boolean) => void;
export type AnyCallback = (() => void) | IndexedCallback;
/**
 * Callback that runs for each iteration of the timer
 */
export type IndexedCallback = (index: number) => void;
export type BaseOptions = {
    /**
     * Interval between each callback
     */
    interval: number;
    /**
     * Maximum amount of time the timer may run for
     */
    timeout: number;
};
export type OptionsWithCount = {
    /**
     * How many times the timer should repeat
     */
    count: number;
} & BaseOptions;
export type OptionsWithError = {
    /**
     * Callback to run when an error occurs _(usually a timeout)_
     */
    errorCallback?: () => void;
};
export type RepeatOptions = {
    /**
     * Callback to run after the timer has finished (or is stopped)
     * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
     */
    afterCallback?: AfterCallback;
} & OptionsWithCount & OptionsWithError;
export type TimerOptions = {} & RepeatOptions;
export type TimerState = {
    active: boolean;
    callback: AnyCallback;
    count?: number;
    elapsed?: number;
    frame?: number;
    index?: number;
    isRepeated: boolean;
    minimum: number;
    paused: boolean;
    trace: unknown;
};
export type WaitOptions = {} & BaseOptions & OptionsWithError;
export type WhenOptions = {} & OptionsWithCount;
export type WhenState = {
    promise: Promise<void>;
    rejecter?: () => void;
    resolver?: () => void;
    timer: Timer;
};
export type WorkType = 'continue' | 'pause' | 'restart' | 'start' | 'stop';
