import {expect, test} from 'bun:test';
import {getEventPosition} from '../src/js/event';
import supportsTouch from '../src/js/touch';

test('getEventPosition', () => {
	const event = new MouseEvent('click', {
		clientX: 10,
		clientY: 20,
	});

	const touchEvent = new TouchEvent('touchstart', {
		touches: [
			new Touch({
				clientX: 20,
				clientY: 10,
				identifier: -1,
				target: document.body,
			}),
		],
	});

	const position = getEventPosition(event);
	const touchPosition = getEventPosition(touchEvent);

	expect(position?.x).toBe(10);
	expect(position?.y).toBe(20);

	expect(touchPosition?.x).toBe(20);
	expect(touchPosition?.y).toBe(10);

	// @ts-expect-error Testing invalid input
	expect(getEventPosition(123)).toBeUndefined();

	// @ts-expect-error Testing invalid input
	expect(getEventPosition([])).toBeUndefined();
});

test('supportsTouch', () => {
	expect(supportsTouch).toBe(false);
});
