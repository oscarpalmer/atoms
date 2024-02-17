// Based on https://github.com/focus-trap/tabbable :-)

type ElementWithTabIndex = {
	element: FocusableElement;
	tabIndex: number;
};

type Filter = (item: ElementWithTabIndex) => boolean;
type FocusableElement = HTMLElement | SVGElement;
type GetType = 'focusable' | 'tabbable';
type InertElement = FocusableElement & {inert: boolean};
type TabbableElement = FocusableElement;

const audioDetailsVideoPattern = /^(audio|details|video)$/i;
const booleanPattern = /^(|true)$/i;

const focusableFilters: Filter[] = [
	_isDisabled,
	_isInert,
	_isHidden,
	_isSummarised,
];

const inputPattern = /^(button|input|select|textarea)$/i;

const selector = [
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]:not(slot)',
	'a[href]',
	'audio[controls]',
	'button',
	'details',
	'details > summary:first-of-type',
	'input',
	'select',
	'textarea',
	'video[controls]',
]
	.map(selector => `${selector}:not([inert])`)
	.join(',');

const summaryPattern = /^summary$/i;

const tabbableFilters: Filter[] = [
	_isNotTabbable,
	_isNotTabbableRadio,
	...focusableFilters,
];

function _getItem(
	type: GetType,
	element: FocusableElement,
): ElementWithTabIndex {
	return {
		element,
		tabIndex: type === 'focusable' ? -1 : _getTabIndex(element),
	};
}

function _getTabIndex(element: FocusableElement): number {
	if (
		element.tabIndex < 0 &&
		(audioDetailsVideoPattern.test(element.tagName) || _isEditable(element)) &&
		!_hasTabIndex(element)
	) {
		return 0;
	}

	return element.tabIndex;
}

function _getValidElements(
	type: GetType,
	parent: Element,
	filters: Filter[],
): Array<FocusableElement> {
	const items: ElementWithTabIndex[] = Array.from(
		parent.querySelectorAll(selector),
	)
		.map(element => _getItem(type, element as FocusableElement))
		.filter(item => !filters.some(filter => filter(item)));

	if (type === 'focusable') {
		return items.map(item => item.element);
	}

	const indiced: Array<Array<FocusableElement>> = [];
	const zeroed: Array<FocusableElement> = [];

	for (const item of items) {
		if (item.tabIndex === 0) {
			zeroed.push(item.element);
		} else {
			indiced[item.tabIndex] = [
				...(indiced[item.tabIndex] ?? []),
				item.element,
			];
		}
	}

	return [...indiced.flat(), ...zeroed];
}

function _hasTabIndex(element: FocusableElement): boolean {
	return !Number.isNaN(
		Number.parseInt(element.getAttribute('tabindex') as string, 10),
	);
}

function _isDisabled(item: ElementWithTabIndex): boolean {
	if (
		inputPattern.test(item.element.tagName) &&
		_isDisabledFromFieldset(item.element)
	) {
		return true;
	}

	return (
		((item.element as HTMLInputElement).disabled ?? false) ||
		item.element.getAttribute('aria-disabled') === 'true'
	);
}

function _isDisabledFromFieldset(element: FocusableElement): boolean {
	let parent = element.parentElement;

	while (parent !== null) {
		if (parent instanceof HTMLFieldSetElement && parent.disabled) {
			const children = Array.from(parent.children);

			for (const child of children) {
				if (child instanceof HTMLLegendElement) {
					return parent.matches('fieldset[disabled] *')
						? true
						: !child.contains(element);
				}
			}

			return true;
		}

		parent = parent.parentElement;
	}

	return false;
}

function _isEditable(element: Element): boolean {
	return booleanPattern.test(element.getAttribute('contenteditable') as string);
}

function _isHidden(item: ElementWithTabIndex) {
	if (
		((item.element as HTMLElement).hidden ?? false) ||
		(item.element instanceof HTMLInputElement && item.element.type === 'hidden')
	) {
		return true;
	}

	const isDirectSummary = item.element.matches(
		'details > summary:first-of-type',
	);

	const nodeUnderDetails = isDirectSummary
		? item.element.parentElement
		: item.element;

	if (nodeUnderDetails?.matches('details:not([open]) *') ?? false) {
		return true;
	}

	const style = getComputedStyle(item.element);

	if (style.display === 'none' || style.visibility === 'hidden') {
		return true;
	}

	const {height, width} = item.element.getBoundingClientRect();

	return height === 0 && width === 0;
}

function _isInert(item: ElementWithTabIndex): boolean {
	return (
		((item.element as InertElement).inert ?? false) ||
		booleanPattern.test(item.element.getAttribute('inert') as string) ||
		(item.element.parentElement !== null &&
			_isInert({
				element: item.element.parentElement as FocusableElement,
				tabIndex: -1,
			}))
	);
}

function _isNotTabbable(item: ElementWithTabIndex) {
	return (item.tabIndex ?? -1) < 0;
}

function _isNotTabbableRadio(item: ElementWithTabIndex): boolean {
	if (
		!(item.element instanceof HTMLInputElement) ||
		item.element.type !== 'radio' ||
		!item.element.name ||
		item.element.checked
	) {
		return false;
	}

	const parent =
		item.element.form ??
		item.element.getRootNode?.() ??
		item.element.ownerDocument;

	const realName = CSS?.escape?.(item.element.name) ?? item.element.name;

	const radios = Array.from(
		(parent as Element).querySelectorAll(
			`input[type="radio"][name="${realName}"]`,
		),
	) as HTMLInputElement[];

	const checked = radios.find(radio => radio.checked);

	return checked !== undefined && checked !== item.element;
}

function _isSummarised(item: ElementWithTabIndex) {
	return (
		item.element instanceof HTMLDetailsElement &&
		Array.from(item.element.children).some(child =>
			summaryPattern.test(child.tagName),
		)
	);
}

function _isValidElement(element: Element, filters: Filter[]): boolean {
	const item = _getItem('focusable', element as FocusableElement);

	return !filters.some(filter => filter(item));
}

/**
 * Get a list of focusable elements within a parent element
 */
export function getFocusableElements(parent: Element): FocusableElement[] {
	return _getValidElements('focusable', parent, focusableFilters);
}

/**
 * Get a list of tabbable elements within a parent element
 */
export function getTabbableElements(parent: Element): TabbableElement[] {
	return _getValidElements('tabbable', parent, tabbableFilters);
}

/**
 * Is the element focusable?
 */
export function isFocusableElement(element: Element): boolean {
	return _isValidElement(element, focusableFilters);
}

/**
 * Is the element tabbable?
 */
export function isTabbableElement(element: Element): boolean {
	return _isValidElement(element, tabbableFilters);
}
