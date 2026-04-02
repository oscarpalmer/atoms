import {isArrayMethod} from '../helpers.js';

/**
 * @typedef Plugin
 * @property {string} name
 * @property {import('eslint').Rule.RuleModule} value
 */

const message = "Prefer the use of 'sort()' (@oscarpalmer/atoms) over 'Array.prototype.sort()'";

const methods = new Set(['sort']);

/**
 * @type {Plugin}
 */
export default {
	name: 'array.sort',
	value: {
		create(context) {
			return {
				CallExpression(node) {
					if (isArrayMethod(context, node, methods)) {
						context.report({
							message,
							node,
						});
					}
				},
			};
		},
		meta: {
			docs: {
				description: message,
			},
			type: 'suggestion',
		},
	},
};
