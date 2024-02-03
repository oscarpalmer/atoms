import {expect, test} from 'bun:test';
import {findParentElement, getElementUnderPointer} from '../src/js/element';

document.body.innerHTML = `<div>
	<div class="target">
		<div hidden>
			<div id="origin">
				<span id="hover" style="pointer-events: none"></span>
			</div>
		</div>
	</div>
</div>`;

test('findParentElement', () => {
	const hidden = document.querySelector('[hidden]');
	const origin = document.getElementById('origin');
	const target = document.querySelector('.target');

	if (origin === null) {
		return;
	}

	expect(findParentElement(origin, '.target')).toBe(target);

	expect(findParentElement(origin, element => element.id === 'origin')).toBe(
		origin,
	);

	expect(
		findParentElement(origin, element => (element as HTMLElement).hidden),
	).toBe(hidden);

	// @ts-expect-error Testing invalid input
	expect(findParentElement(null, 'span')).toBe(undefined);

	expect(findParentElement(origin, 'noop')).toBe(undefined);
});

test('getElementUnderPointer', () => {
	const origin = document.getElementById('origin');
	const hover = document.getElementById('hover');

	if (origin === null || hover === null) {
		return;
	}

	expect(getElementUnderPointer()).toBe(origin);
	expect(getElementUnderPointer(true)).toBe(hover);
});
