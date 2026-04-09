/**
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @returns {boolean}
 */
function isStringify(node) {
	const {callee} = node;

	if (callee.name === stringName) {
		return true;
	}

	const {property} = callee;

	if (
		callee.type !== memberExpression ||
		property == null ||
		property.type !== identifierExpression ||
		property.name !== toStringName
	) {
		return false;
	}

	// TODO: check .toString usage

	return false;
}

const message = "Prefer 'getString' (@oscarpalmer/atoms) instead of 'toString' and 'String'";

const selectors = [
	`[callee.name="${stringName}"]`,
];

export default {
	message,
	selectors,
	name: 'string.getString',
	value: {
		createOnce(context) {
			return {
				CallExpression(node) {
					if (isStringify(node)) {
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

const identifierExpression = 'Identifier';

const memberExpression = 'MemberExpression';

const stringName = 'String';

const toStringName = 'toString';
