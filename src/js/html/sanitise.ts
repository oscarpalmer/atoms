import {
	isBadAttribute,
	isEmptyNonBooleanAttribute,
	isInvalidBooleanAttribute,
} from '../element';

export type SanitiseOptions = {
	/**
	 * - Sanitise boolean attributes? _(Defaults to `true`)_
	 * - E.g. `checked="abc"` => `checked=""`
	 */
	sanitiseBooleanAttributes?: boolean;
};

/**
 * - Sanitise one or more nodes _(as well as all their children)_:
 * - Removes or sanitises bad attributes
 */
export function sanitise(
	value: Node | Node[],
	options?: Partial<SanitiseOptions>,
): Node[] {
	return sanitiseNodes(Array.isArray(value) ? value : [value], {
		sanitiseBooleanAttributes: options?.sanitiseBooleanAttributes ?? true,
	});
}

function sanitiseAttributes(
	element: Element,
	attributes: Attr[],
	options: SanitiseOptions,
): void {
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const {name, value} = attributes[index];

		if (
			isBadAttribute(name, value) ||
			isEmptyNonBooleanAttribute(name, value)
		) {
			element.removeAttribute(name);
		} else if (
			options.sanitiseBooleanAttributes &&
			isInvalidBooleanAttribute(name, value)
		) {
			element.setAttribute(name, '');
		}
	}
}

function sanitiseNodes(nodes: Node[], options: SanitiseOptions): Node[] {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			sanitiseAttributes(node, [...node.attributes], options);
		}

		sanitiseNodes([...node.childNodes], options);
	}

	return nodes;
}
