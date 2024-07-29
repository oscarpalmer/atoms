function calculateDistance(origin: Element, target: Element): number {
	if (origin === target || origin.parentElement === target) {
		return 0;
	}

	const comparison = origin.compareDocumentPosition(target);
	const children = [...(origin.parentElement?.children ?? [])];

	switch (true) {
		case children.includes(target):
			return Math.abs(children.indexOf(origin) - children.indexOf(target));

		case !!(comparison & 2 || comparison & 8):
			// Target element is before or holds the origin element
			return traverse(origin, target);

		case !!(comparison & 4 || comparison & 16):
			// Origin element is before or holds the target element
			return traverse(target, origin);

		default:
			return -1;
	}
}

/**
 * - Finds the closest elements to the origin element that matches the selector
 * - Traverses up, down, and sideways in the _DOM_-tree
 */
export function closest(
	origin: Element,
	selector: string,
	context?: Document | Element,
): Element[] {
	if (origin.matches(selector)) {
		return [origin];
	}

	const elements = [...(context ?? document).querySelectorAll(selector)];
	const {length} = elements;

	if (length === 0) {
		return [];
	}

	const distances = [];

	let minimum: number | null = null;

	for (let index = 0; index < length; index += 1) {
		const element = elements[index];
		const distance = calculateDistance(origin, element);

		if (distance < 0) {
			continue;
		}

		if (minimum == null || distance < minimum) {
			minimum = distance;
		}

		distances.push({
			distance,
			element,
		});
	}

	return minimum == null
		? []
		: distances
				.filter(found => found.distance === minimum)
				.map(found => found.element);
}

function traverse(from: Element, to: Element): number {
	const children = [...to.children];

	if (children.includes(from)) {
		return children.indexOf(from) + 1;
	}

	let current = from;
	let distance = 0;
	let parent: Element | null = from.parentElement;

	while (parent != null) {
		if (parent === to) {
			return distance + 1;
		}

		const children = [...(parent.children ?? [])];

		if (children.includes(to)) {
			return (
				distance + Math.abs(children.indexOf(current) - children.indexOf(to))
			);
		}

		const index = children.findIndex(child => child.contains(to));

		if (index > -1) {
			return (
				distance +
				Math.abs(index - children.indexOf(current)) +
				traverse(to, children[index])
			);
		}

		current = parent;
		distance += 1;
		parent = parent.parentElement;
	}

	return -1_000_000;
}
