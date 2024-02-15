type Position = {
    x: number;
    y: number;
};
/**
 * Get the X- and Y-coordinates from a pointer event
 */
export declare function getEventPosition(event: MouseEvent | TouchEvent): Position | undefined;
export {};
