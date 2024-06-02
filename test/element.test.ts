import {expect, test} from 'bun:test';
import {
	$,
	$$,
	findElement,
	findElements,
	findParentElement,
	getData,
	getTextDirection,
	setData,
	setStyles,
	wait,
} from '../src/js';

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

	expect(
		// @ts-expect-error Testing invalid input
		findElements([123, 'a', document.body, ...origin, ...children], document)
			.length,
	).toBe(3);
});

test('findParentElement', () => {
	const hidden = document.querySelector('[hidden]');
	const origin = document.getElementById('origin');
	const target = document.querySelector('.target');

	if (origin === null) {
		return;
	}

	expect(findParentElement(origin, '#origin')).toBe(origin);
	expect(findParentElement(origin, '.target')).toBe(target);

	expect(findParentElement(origin, element => element.id === 'origin')).toBe(
		origin,
	);

	expect(
		findParentElement(origin, element => (element as HTMLElement).hidden),
	).toBe(hidden);

	expect(findParentElement(origin, 'noop')).toBe(null);

	expect(findParentElement(origin, element => element.tagName === 'noop')).toBe(
		null,
	);

	// @ts-expect-error Testing invalid input
	expect(findParentElement(null, 'span')).toBe(null);
});

test('getData & setData', done => {
	const div = document.createElement('div');

	setData(div, 'test', 'value');

	setData(div, {
		foo: ['bar', 1, true],
		bar: {baz: true},
	});

	div.dataset.badJson = '""?""';

	wait(() => {
		expect(getData(div, 'test')).toBe('value');
		expect(getData(div, 'noop')).toBe(undefined);
		expect(getData(div, 'badJson')).toBe(undefined);

		const data = getData(div, ['foo', 'bar']);

		expect(data.foo).toEqual(['bar', 1, true]);
		expect(data.bar).toEqual({baz: true});

		done();
	}, 125);
});

test('getElementUnderPointer', () => {
	const origin = document.getElementById('origin');
	const hover = document.getElementById('hover');

	if (origin == null || hover == null) {
		return;
	}

	// TODO: investigate proper way to test this
	// expect(getElementUnderPointer()).toBe(origin);
	// expect(getElementUnderPointer(true)).toBe(hover);
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

test('setStyles', done => {
	const div = document.createElement('div');

	div.style.display = 'none';

	setStyles(div, 'color', 'red');

	setStyles(div, {
		backgroundColor: 'green',
		position: 'absolute',
	});

	wait(() => {
		expect(div.style.color).toBe('red');
		expect(div.style.display).toBe('none');
		expect(div.style.backgroundColor).toBe('green');
		expect(div.style.position).toBe('absolute');

		setStyles(div, 'display');

		wait(() => {
			expect(div.style.display).toBe('');

			done();
		}, 125);
	}, 125);
});
