/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
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
 * - If `all` is `true`, all elements under the pointer are returned
 */
export function getElementUnderPointer(all?: boolean): Element | undefined {
	const elements = Array.from(document.querySelectorAll(':hover')).filter(
		element => {
			const style = window.getComputedStyle(element);

			return (
				element.tagName !== 'HEAD' &&
				(typeof all === 'boolean' && all
					? true
					: style.pointerEvents !== 'none' && style.visibility !== 'hidden')
			);
		},
	);

	return elements[elements.length - 1];
}
