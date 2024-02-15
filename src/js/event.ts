type Position = {
	x: number;
	y: number;
};

/**
 * Get the X- and Y-coordinates from a pointer event
 */
export function getEventPosition(
	event: MouseEvent | TouchEvent,
): Position | undefined {
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
