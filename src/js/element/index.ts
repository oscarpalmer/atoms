type Selector = string | Element | Element[] | NodeList;

type TextDirection = 'ltr' | 'rtl';

/**
 * - Find the first element that matches the selector
 * - `context` is optional and defaults to `document`
 */
export function findElement(
	selector: Selector,
	context?: Selector,
): Element | undefined {
	return findElements(selector, context)[0];
}

/**
 * - Find elements that match the selector
 * - `context` is optional and defaults to `document`
 */
export function findElements(
	selector: Selector,
	context?: Selector,
): Element[] {
	const contexts = context === undefined ? [document] : findElements(context);

	const elements: Element[] = [];

	if (typeof selector === 'string') {
		const {length} = contexts;

		let index = 0;

		for (; index < length; index += 1) {
			elements.push(
				...Array.from((contexts[index] as Element).querySelectorAll(selector) ?? []),
			);
		}

		return elements;
	}

	const nodes =
		Array.isArray(selector) || selector instanceof NodeList
			? selector
			: [selector];

	const {length} = nodes;

	let index = 0;

	for (; index < length; index += 1) {
		const node = nodes[index];

		if (
			node instanceof Element &&
			contexts.some(context => context.contains(node))
		) {
			elements.push(node);
		}
	}

	return elements;
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
		return undefined;
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
			return undefined;
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
				(typeof skipIgnore === 'boolean' && skipIgnore) ||
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

export {findElement as $, findElements as $$} from '.';
