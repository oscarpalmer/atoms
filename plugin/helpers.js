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
function getMethods(methods, prefix) {
	const array = [...methods];
	const {length} = array;

	let names = '';

	for (let index = 0; index < length; index += 1) {
		const method = array[index];

		const name = prefix == null ? method : `${prefix}.${method}`;

		if (index === 0) {
			names = `'${name}'`;
		} else if (length === 2) {
			names += ` and '${name}'`;
		} else {
			names += index === length - 1 ? `, and '${name}'` : `, '${name}'`;
		}
	}

	return names;
}

/**
 * @param {string} type
 * @param {string} name
 * @param {Set<string>} methods
 * @param {boolean|undefined} isStatic
 * @param {boolean|undefined} isGlobal
 * @returns {Plugin}
 */
export function getPlugin(type, name, methods, isStatic, isGlobal) {
	const globalMethod = isGlobal ?? false;
	const staticMethod = isStatic ?? false;

	const fullName = `${type}.${name}`;
	const prefix = globalMethod ? undefined : staticMethod ? objects[type] : prefixes[type];

	const message = `Prefer using '${name}' (@oscarpalmer/atoms) instead of ${getMethods(methods, prefix)}`;

	return {
		message,
		name: fullName,
		selectors: getSelectors(type, methods, staticMethod, globalMethod),
		value: {
			createOnce(context) {
				return {
					CallExpression(node) {
						if (isCall(type, context, node, methods, staticMethod, globalMethod)) {
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
 * @param {string} type
 * @param {Set<string>} methods
 * @param {boolean} isStatic
 * @param {boolean} isGlobal
 * @returns {string[]}
 */
function getSelectors(type, methods, isStatic, isGlobal) {
	const array = [...methods];
	const {length} = array;

	const origin = isGlobal
		? ''
		: isStatic
			? `[callee.object.type="${identifierExpression}"][callee.object.name="${objects[type]}"]`
			: `[callee.object.type="${typeExpressions[type]}"]`;

	const selectors = [];

	for (let index = 0; index < length; index += 1) {
		const method = array[index];

		selectors.push(
			isGlobal
				? `CallExpression[callee.name="${method}"]`
				: `CallExpression[callee.type="${memberExpression}"]${origin}[callee.property.type="${identifierExpression}"][callee.property.name="${method}"]`,
		);
	}

	return selectors;
}

/**
 * @param {string} type
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @param {Set<string>} methods
 * @param {boolean} isStatic
 * @param {boolean} isGlobal
 * @returns {boolean}
 */
function isCall(type, context, node, methods, isStatic, isGlobal) {
	const {callee} = node;

	if (isGlobal) {
		return methods.has(callee.name);
	}

	if (callee.type !== memberExpression || !methods.has(callee.property.name)) {
		return false;
	}

	return isStatic
		? isStaticMethod(type, context, node, methods)
		: isInstanceMethod(type, context, node, methods);
}

/**
 * @param {string} type
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @param {Set<string>} methods
 * @returns {boolean}
 */
function isInstanceMethod(type, context, node, methods) {
	const {object, property} = node.callee;

	if (object.type === literalExpression) {
		return isLiteralMethod(type, context, node, methods);
	}

	if (object.type !== typeExpressions[type]) {
		return property.type === identifierExpression && isLiteralMethod(type, context, node, methods);
	}

	return property.type === identifierExpression;
}

/**
 * @param {string} type
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @param {Set<string>} methods
 * @returns {boolean}
 */
function isLiteralMethod(_, __, ___, ____) {
	// TODO: check literal value

	return false;
}

/**
 * @param {string} type
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').CallExpression & import('eslint').Rule.NodeParentExtension} node
 * @param {Set<string>} methods
 * @returns {boolean}
 */
function isStaticMethod(type, context, node, _) {
	const {object, property} = node.callee;

	if (object.type !== identifierExpression || object.name !== objects[type]) {
		return false;
	}

	return property.type === identifierExpression;
}

const arrayExpression = 'ArrayExpression';

const identifierExpression = 'Identifier';

const literalExpression = 'Literal';

const memberExpression = 'MemberExpression';

const objectExpression = 'ObjectExpression';

const objects = {
	array: 'Array',
	math: 'Math',
	promise: 'Promise',
	string: 'String',
	value: 'Object',
};

const prefixes = {
	array: 'Array.prototype',
	string: 'String.prototype',
};

const typeExpressions = {
	array: arrayExpression,
	string: literalExpression,
	value: objectExpression,
};
