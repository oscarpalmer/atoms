import type { EventPosition } from './models';
/**
 * Get the X- and Y-coordinates from a pointer event
 */
export declare function getPosition(event: MouseEvent | TouchEvent): EventPosition | undefined;
