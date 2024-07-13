import {setElementValues, updateElementValue} from '../internal/element-value';

/**
 * Set styles on an element
 */
export function setStyles(
	element: HTMLElement,
	styles: Partial<CSSStyleDeclaration>,
): void;

/**
 * Set a style on an element
 */
export function setStyles(
	element: HTMLElement,
	key: keyof CSSStyleDeclaration,
	value?: string,
): void;

export function setStyles(
	element: HTMLElement,
	first: Partial<CSSStyleDeclaration> | keyof CSSStyleDeclaration,
	second?: unknown,
): void {
	setElementValues(element, first as string, second, updateStyleProperty);
}

function updateStyleProperty(
	element: HTMLElement,
	key: string,
	value: unknown,
): void {
	updateElementValue(
		element,
		key,
		value,
		function (this: HTMLElement, key: string, value: string) {
			this.style[key as never] = value;
		},
		function (this: HTMLElement, key: string) {
			this.style[key as never] = '';
		},
		false,
	);
}
