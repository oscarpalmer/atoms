type Position = {
    x: number;
    y: number;
};
/**
 * Does the browser support touch events?
 */
export declare const supportsTouch: boolean;
/**
 * Get the X- and Y-coordinates from a pointer event
 */
export declare function getPosition(event: MouseEvent | TouchEvent): Position | undefined;
export {};
