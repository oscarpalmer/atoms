import type {EventPosition} from './models';

/**
 * Get the X- and Y-coordinates from a pointer event
 */
export function getPosition(
	event: MouseEvent | TouchEvent,
): EventPosition | undefined {
	let x: number | undefined;
	let y: number | undefined;

	if (event instanceof MouseEvent) {
		x = event.clientX;
		y = event.clientY;
	} else if (event instanceof TouchEvent) {
		x = event.touches[0]?.clientX;
		y = event.touches[0]?.clientY;
	}

	return typeof x === 'number' && typeof y === 'number' ? {x, y} : undefined;
}
