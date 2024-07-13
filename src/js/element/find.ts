type Selector = string | Document | Element | Element[] | NodeList;

/**
 * - Find the first element that matches the selector
 * - `context` is optional and defaults to `document`
 */
export function findElement(
	selector: string,
	context?: Selector,
): Element | undefined {
	return findElementOrElements(selector, context, true) as never;
}

function findElementOrElements(
	selector: Selector,
	context: Selector | undefined,
	single: boolean,
): Element | Element[] | undefined {
	const callback = single ? document.querySelector : document.querySelectorAll;

	const contexts =
		context == null
			? [document]
			: (findElementOrElements(context, undefined, false) as Element[]);

	const result: Element[] = [];

	if (typeof selector === 'string') {
		const {length} = contexts;

		for (let index = 0; index < length; index += 1) {
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

	for (let index = 0; index < length; index += 1) {
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
 * - Find elements that match the selector
 * - If `selector` is a node or a list of nodes, they are filtered and returned
 * - `context` is optional and defaults to `document`
 */
export function findElements(
	selector: Selector,
	context?: Selector,
): Element[] {
	return findElementOrElements(selector, context, false) as never;
}

/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 * - If no match is found, `null` is returned
 */
export function findParentElement(
	origin: Element,
	selector: string | ((element: Element) => boolean),
): Element | null {
	if (origin == null || selector == null) {
		return null;
	}

	if (typeof selector === 'string') {
		if (origin.matches?.(selector)) {
			return origin;
		}

		return origin.closest(selector);
	}

	if (selector(origin)) {
		return origin;
	}

	let parent: Element | null = origin.parentElement;

	while (parent != null && !selector(parent)) {
		if (parent === document.body) {
			return null;
		}

		parent = parent.parentElement;
	}

	return parent;
}

export {findElement as $, findElements as $$};
