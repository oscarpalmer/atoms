/**
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @returns {boolean}
 */
function isTryCatch(node) {
	if (node.parent == null) {
		return false;
	}

	if (node.parent.type === statement) {
		return true;
	}

	return isTryCatch(node.parent);
}

const message = "Prefer 'attempt' (@oscarpalmer/atoms) instead of try-catch blocks";

const selector = 'TryStatement > BlockStatement';

export default {
	message,
	name: 'attempt',
	selectors: [selector],
	value: {
		createOnce(context) {
			return {
				CallExpression(node) {
					if (isTryCatch(node)) {
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

const statement = 'TryStatement';
