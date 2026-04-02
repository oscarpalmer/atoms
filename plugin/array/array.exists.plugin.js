import {isArrayMethod} from '../helpers.js';

/**
 * @typedef Plugin
 * @property {string} name
 * @property {import('eslint').Rule.RuleModule} value
 */

const message =
	"Prefer the use of 'exists()' (@oscarpalmer/atoms) over 'Array.prototype.includes()'";

const methods = new Set(['includes']);

/**
 * @type {Plugin}
 */
export default {
	name: 'array.exists',
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
