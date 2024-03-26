type Selector = string | Document | Element | Element[] | NodeList;

type TextDirection = 'ltr' | 'rtl';

function _findElements(
	selector: Selector,
	context: Selector | undefined,
	single: boolean,
): Element | Element[] | undefined {
	const callback = single ? document.querySelector : document.querySelectorAll;

	const contexts =
		context == null
			? [document]
			: (_findElements(context, undefined, false) as Element[]);

	const result: Element[] = [];

	if (typeof selector === 'string') {
		const {length} = contexts;

		let index = 0;

		for (; index < length; index += 1) {
			const value = callback.call(contexts[index], selector) as
				| Element
				| Element[]
				| null;

			if (single) {
				if (value == null) {
					continue;
				}

				return value;
			}

			result.push(...Array.from(value as Element[]));
		}

		return single
			? undefined
			: result.filter((value, index, array) => array.indexOf(value) === index);
	}

	const nodes = Array.isArray(selector)
		? selector
		: selector instanceof NodeList
		  ? Array.from(selector)
		  : [selector];

	const {length} = nodes;

	let index = 0;

	for (; index < length; index += 1) {
		const node = nodes[index];

		const element =
			node instanceof Document
				? node.body
				: node instanceof Element
				  ? node
				  : undefined;

		if (
			element != null &&
			(context == null ||
				contexts.length === 0 ||
				contexts.some(
					context => context === element || context.contains(element),
				)) &&
			!result.includes(element)
		) {
			result.push(element);
		}
	}

	return result;
}

/**
 * - Find the first element that matches the selector
 * - `context` is optional and defaults to `document`
 */
export function findElement(
	selector: string,
	context?: Selector,
): Element | undefined {
	return _findElements(selector, context, true) as never;
}

/**
 * - Find elements that match the selector
 * - If `selector` is a node or a list of nodes, they are filtered and returned
 * - `context` is optional and defaults to `document`
 */
export function findElements(
	selector: Selector,
	context?: Selector,
): Element[] {
	return _findElements(selector, context, false) as never;
}

/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 * - If no match is found, `undefined` is returned
 */
export function findParentElement(
	origin: Element,
	selector: string | ((element: Element) => boolean),
): Element | undefined {
	if (origin == null || selector == null) {
		return;
	}

	function matches(element: Element): boolean {
		return typeof selector === 'string'
			? element.matches?.(selector) ?? false
			: typeof selector === 'function'
			  ? selector(element)
			  : false;
	}

	if (matches(origin)) {
		return origin;
	}

	let parent: Element | null = origin.parentElement;

	while (parent != null && !matches(parent)) {
		if (parent === document.body) {
			return;
		}

		parent = parent.parentElement;
	}

	return parent ?? undefined;
}

/**
 * - Get the most specific element under the pointer
 * - Ignores elements with `pointer-events: none` and `visibility: hidden`
 * - If `skipIgnore` is `true`, no elements are ignored
 */
export function getElementUnderPointer(
	skipIgnore?: boolean,
): Element | undefined {
	const elements = Array.from(document.querySelectorAll(':hover')).filter(
		element => {
			if (/^head$/i.test(element.tagName)) {
				return false;
			}

			const style = getComputedStyle(element);

			return (
				skipIgnore === true ||
				(style.pointerEvents !== 'none' && style.visibility !== 'hidden')
			);
		},
	);

	return elements[elements.length - 1];
}

/**
 * Get the text direction of an element
 */
export function getTextDirection(element: Element): TextDirection {
	const direction = element.getAttribute('dir');

	if (direction !== null && /^(ltr|rtl)$/i.test(direction)) {
		return direction.toLowerCase() as TextDirection;
	}

	return (
		getComputedStyle?.(element)?.direction === 'rtl' ? 'rtl' : 'ltr'
	) as TextDirection;
}

export {findElement as $, findElements as $$};
