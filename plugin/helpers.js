/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @param {Set<string>} methods
 * @returns {boolean}
 */
export function isArrayMethod(context, node, methods) {
	const {callee} = node;

	if (callee.type !== memberExpression) {
		return false;
	}

	const {object, property} = callee;

	return (
		object.type === arrayExpression &&
		property.type === identifierType &&
		methods.has(property.name)
	);
}

const arrayExpression = 'ArrayExpression';

const memberExpression = 'MemberExpression';

const identifierType = 'Identifier';
