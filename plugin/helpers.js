/**
 * @typedef Name
 * @property {string} full
 * @property {string} short
 */

/**
 * @typedef Plugin
 * @property {string} message
 * @property {string} name
 * @property {string[]} selectors
 * @property {import('eslint').Rule.RuleModule} value
 */

/**
 * @typedef Validator
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @param {Set<string>} methods
 * @returns {boolean}
 */

/**
 * @param {Set<string>} methods
 * @param {string|undefined} prefix
 * @returns {string}
 */
function getMethodNames(methods, prefix) {
	const array = [...methods];
	const {length} = array;

	let names = '';

	for (let index = 0; index < length; index += 1) {
		const method = array[index];

		const name = prefix == null ? method : `${prefix}.${method}`;

		if (index === 0) {
			names = `'${name}'`;
		} else {
			names += index === length - 1 ? `, and '${name}'` : `, '${name}'`;
		}
	}

	return names;
}

/**
 * @param {Name} name
 * @param {Set<string>} methods
 * @param {Validator} validator
 * @param {string|undefined} prefix
 * @returns {Plugin}
 */
export function getPlugin(name, methods, validator, prefix) {
	const message = `Prefer using '${name.short}' (@oscarpalmer/atoms) instead of ${getMethodNames(methods, prefix)}`;

	return {
		message,
		name: name.full,
		selectors: getSelectors(methods),
		value: {
			create(context) {
				return {
					CallExpression(node) {
						if (validator(context, node, methods)) {
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
}

/**
 * @param {Set<string>} methods
 * @returns {string[]}
 */
function getSelectors(methods) {
	const array = [...methods];
	const {length} = array;

	const selectors = [];

	for (let index = 0; index < length; index += 1) {
		const method = array[index];

		selectors.push(
			`CallExpression[callee.type="${memberExpression}"][callee.object.type="${arrayExpression}"][callee.property.type="${identifierType}"][callee.property.name="${method}"]`,
		);
	}

	return selectors;
}

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
