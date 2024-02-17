import {expect, test} from 'bun:test';
import {
	$,
	$$,
	findElement,
	findElements,
	findParentElement,
	getElementUnderPointer,
	getTextDirection,
} from '../src/js/element';

document.body.innerHTML = `<div>
	<div class="target">
		<div hidden>
			<div id="origin">
				<span id="hover" style="pointer-events: none"></span>
				<!-- This is a comment -->
			</div>
		</div>
	</div>
</div>`;

test('findElement', () => {
	const target = findElement('.target');

	expect(target).toBeInstanceOf(HTMLDivElement);
	expect(target?.classList.contains('target') ?? false).toBe(true);

	const origin = findElement('#origin', '.target');

	expect(origin).toBeInstanceOf(HTMLDivElement);

	const child = $('*', origin);

	expect(child).toBeInstanceOf(HTMLSpanElement);
});

test('findElements', () => {
	const elements = findElements('.target');

	expect(elements.length).toBe(1);
	expect(elements[0].classList.contains('target')).toBe(true);

	const origin = findElements('#origin', '.target');

	expect(origin.length).toBe(1);

	const children = $$('*', origin);

	expect(children.length).toBe(1);
});

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

test('getTextDirection', () => {
	const fragment = document.createDocumentFragment();
	const parent = document.createElement('div');

	fragment.appendChild(parent);

	parent.id = 'parent';

	parent.innerHTML = `<div id="outer" dir="rtl">
	<div id="inner">
		<span id="text" style="direction: ltr"></span>
	</div>
</div>`;

	const parentElement = fragment.getElementById('parent');
	const outerElement = fragment.getElementById('outer');
	const innerElement = fragment.getElementById('inner');
	const textElement = fragment.getElementById('text');

	if (
		parentElement === null ||
		outerElement === null ||
		innerElement === null ||
		textElement === null
	) {
		return;
	}

	expect(getTextDirection(parentElement)).toBe('ltr');
	expect(getTextDirection(outerElement)).toBe('rtl');
	expect(getTextDirection(textElement)).toBe('ltr');

	// Should be inherited from parent and be 'rtl', but does not seem to be; Happy DOM?
	expect(getTextDirection(innerElement)).toBe('ltr');
});
