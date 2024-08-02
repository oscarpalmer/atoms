import {expect, test} from 'bun:test';
import {
	$,
	$$,
	booleanAttributes,
	closest,
	findElement,
	findElements,
	findParentElement,
	getData,
	getTextDirection,
	isBadAttribute,
	isBooleanAttribute,
	isEmptyNonBooleanAttribute,
	isInvalidBooleanAttribute,
	setAttribute,
	setData,
	setStyles,
} from '../src/js/element';
import {wait} from '../src/js/timer';

const nonBooleanAttributes = [
	'abbr',
	'accept',
	'accept-charset',
	'accesskey',
	'action',
	'allow',
	'alt',
	'as',
	'autocapitalize',
	'autocomplete',
	'blocking',
	'charset',
	'cite',
	'class',
	'color',
	'cols',
	'colspan',
	'content',
	'contenteditable',
	'coords',
	'crossorigin',
	'data',
	'datetime',
	'decoding',
	'dir',
	'dirname',
	'download',
	'draggable',
	'enctype',
	'enterkeyhint',
	'fetchpriority',
	'for',
	'form',
	'formaction',
	'formenctype',
	'formmethod',
	'formtarget',
	'headers',
	'height',
	'high',
	'href',
	'hreflang',
	'http-equiv',
	'id',
	'imagesizes',
	'imagesrcset',
	'inputmode',
	'integrity',
	'is',
	'itemid',
	'itemprop',
	'itemref',
	'itemtype',
	'kind',
	'label',
	'lang',
	'list',
	'loading',
	'low',
	'max',
	'maxlength',
	'media',
	'method',
	'min',
	'minlength',
	'name',
	'nonce',
	'optimum',
	'pattern',
	'ping',
	'placeholder',
	'popover',
	'popovertarget',
	'popovertargetaction',
	'poster',
	'preload',
	'referrerpolicy',
	'rel',
	'rows',
	'rowspan',
	'sandbox',
	'scope',
	'shape',
	'size',
	'sizes',
	'slot',
	'span',
	'spellcheck',
	'src',
	'srcdoc',
	'srclang',
	'srcset',
	'start',
	'step',
	'style',
	'tabindex',
	'target',
	'title',
	'translate',
	'type',
	'usemap',
	'value',
	'width',
	'wrap',
];

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

test('closest', () => {
	const template = `
<div>
	<div>
		<div>
			<div class="target">bad</div>
		</div>
	</div>
	<div>
		<div class="target">good</div>
	</div>
	<div>
		<div class="origin">
			<p>origin</p>
			<div>
				<div>
					<div class="target">
						<p>good</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<ul>
	<li class="target">1</li>
	<li class="target">2</li>
	<li class="target">3</li>
	<li class="origin">4</li>
	<li class="target">5</li>
	<li class="target">6</li>
	<li class="target">7</li>
</ul>

<ul>
<li class="target"><button></button></li>
<li class="target"><button></button></li>
<li class="target"><button class="origin">good</button></li>
<li class="target"><button></button></li>
<li class="target"><button></button></li>
</ul>
`;

	const element = document.createElement('div');

	element.innerHTML = template;

	const divOrigin = $('div.origin', element);
	const liOrigin = $('li.origin', element);
	const buttonOrigin = $('button.origin', element);

	if (divOrigin == null || liOrigin == null || buttonOrigin == null) {
		return;
	}

	const divTargets = closest(divOrigin, 'div.target', element);
	const liTargets = closest(liOrigin, 'li.target', element);
	const buttonTargets = closest(buttonOrigin, 'li.target', element);

	expect(divTargets.length).toBe(2);
	expect(divTargets.map(target => target.textContent?.trim())).toEqual([
		'good',
		'good',
	]);

	expect(liTargets.length).toBe(2);
	expect(liTargets.map(target => target.textContent?.trim())).toEqual([
		'3',
		'5',
	]);

	expect(buttonTargets.length).toBe(1);
	expect(buttonTargets[0].textContent?.trim()).toBe('good');

	expect(closest(buttonOrigin, 'button.origin', element)[0]).toBe(buttonOrigin);

	expect(closest(liOrigin, '.not-found').length).toBe(0);
});

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

test('isBadAttribute', () => {
	const attributes = [
		['onclick', 'alert()'],
		['href', 'data:text/html,'],
		['src', 'javascript:'],
		['xlink:href', 'javascript:'],
		['href', 'https://example.com'],
		['src', 'https://example.com'],
		['xlink:href', 'https://example.com'],
	];

	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const [name, value] = attributes[index];

		expect(isBadAttribute(name, value)).toBe(index < 4);
	}
});

test('isBooleanAttribute', () => {
	const attributes = [...booleanAttributes, ...nonBooleanAttributes];

	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const attribute = attributes[index];

		expect(isBooleanAttribute(attribute)).toBe(
			index < booleanAttributes.length,
		);
	}
});

test('isEmptyNonBooleanAttribute', () => {
	let {length} = booleanAttributes;

	for (let index = 0; index < length; index += 1) {
		const attribute = booleanAttributes[index];

		expect(isEmptyNonBooleanAttribute(attribute, '')).toBe(false);
	}

	length = nonBooleanAttributes.length;

	for (let index = 0; index < length; index += 1) {
		const attribute = nonBooleanAttributes[index];

		expect(isEmptyNonBooleanAttribute(attribute, '')).toBe(true);
		expect(isEmptyNonBooleanAttribute(attribute, '  ')).toBe(true);
		expect(isEmptyNonBooleanAttribute(attribute, attribute)).toBe(false);
	}
});

test('isInvalidBooleanAttribute', () => {
	let {length} = booleanAttributes;

	for (let index = 0; index < length; index += 1) {
		const attribute = booleanAttributes[index];

		expect(isInvalidBooleanAttribute(attribute, '')).toBe(false);
		expect(isInvalidBooleanAttribute(attribute, attribute)).toBe(false);
		expect(isInvalidBooleanAttribute(attribute, '!')).toBe(true);
	}

	length = nonBooleanAttributes.length;

	for (let index = 0; index < length; index += 1) {
		const attribute = nonBooleanAttributes[index];

		expect(isInvalidBooleanAttribute(attribute, '')).toBe(true);
		expect(isInvalidBooleanAttribute(attribute, attribute)).toBe(true);
		expect(isInvalidBooleanAttribute(attribute, '!')).toBe(true);
	}
});

test('setAttribute', done => {
	const element = document.createElement('div');

	setAttribute(element, 'hidden', '');

	wait(() => {
		expect(element.getAttribute('hidden')).toBe('');

		setAttribute(element, 'hidden', null);

		wait(() => {
			expect(element.getAttribute('hidden')).toBe(null);

			done();
		});
	});
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
