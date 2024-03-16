declare global {
    var _atomic_queued: Set<() => void>;
}
/**
 * Queues a callback to be executed at the next best time
 */
export declare function queue(callback: () => void): void;
