import {isPlainObject} from '../is';
import {sanitise, type SanitiseOptions} from './sanitise';

const templates: Record<string, HTMLTemplateElement> = {};

function createTemplate(html: string): HTMLTemplateElement {
	const template = document.createElement('template');

	template.innerHTML = html;

	templates[html] = template;

	return template;
}

function getNodes(node: Node): Node[] {
	return /^documentfragment$/i.test(node.constructor.name)
		? [...node.childNodes]
		: [node];
}

function getTemplate(value: string): HTMLTemplateElement | undefined {
	if (value.trim().length === 0) {
		return;
	}

	let template: unknown;

	if (/^[\w-]+$/.test(value)) {
		template = document.querySelector(`#${value}`);
	}

	if (template instanceof HTMLTemplateElement) {
		return template;
	}

	return templates[value] ?? createTemplate(value);
}

/**
 * - Create nodes from a string of HTML or a template element
 * - If `value` doesn't contain any whitespace, it will be treated as an ID before falling back to being treated as HTML
 * - If `sanitisation` is not provided, `true`, or an object, bad markup will be sanitised or removed
 * - Regardless of the value of `sanitisation`, scripts will always be removed
 */
export function html(
	value: string,
	sanitisation?: boolean | SanitiseOptions,
): Node[];

/**
 * - Create nodes from a template element
 * - If `sanitisation` is not provided, `true`, or an object, bad markup will be sanitised or removed
 * - Regardless of the value of `sanitisation`, scripts will always be removed
 */
export function html(
	value: HTMLTemplateElement,
	sanitisation?: boolean | SanitiseOptions,
): Node[];

export function html(
	value: string | HTMLTemplateElement,
	sanitisation?: boolean | SanitiseOptions,
): Node[] {
	const options =
		sanitisation == null || sanitisation === true
			? {}
			: isPlainObject(sanitisation)
				? {...sanitisation}
				: null;

	const template =
		value instanceof HTMLTemplateElement
			? value
			: typeof value === 'string'
				? getTemplate(value)
				: null;

	if (template == null) {
		return [];
	}

	const cloned = template.content.cloneNode(true) as DocumentFragment;

	const scripts = cloned.querySelectorAll('script');
	const {length} = scripts;

	for (let index = 0; index < length; index += 1) {
		scripts[index].remove();
	}

	cloned.normalize();

	return options != null
		? sanitise(getNodes(cloned), options)
		: getNodes(cloned);
}

export * from './sanitise';
