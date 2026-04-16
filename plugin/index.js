import {eslintCompatPlugin} from '@oxlint/plugins';
import {groupBy} from '../dist/array/group-by.mjs';
import pkg from '../package.json' with {type: 'json'};
import getStringPlugin from './get-string.js';
import {getPlugin} from './helpers.js';
import tryCatchPlugin from './try-catch.js';

export const arrayPlugins = [
	getPlugin('array', 'exists', new Set(['includes'])),
	getPlugin('array', 'filter', new Set(['filter'])),
	getPlugin('array', 'find', new Set(['find'])),
	getPlugin('array', 'flatten', new Set(['flat'])),
	getPlugin('array', 'indexOf', new Set(['findIndex', 'indexOf'])),
	getPlugin('array', 'push', new Set(['push'])),
	getPlugin('array', 'slice', new Set(['slice'])),
	getPlugin('array', 'sort', new Set(['sort'])),
	getPlugin('array', 'splice', new Set(['splice'])),
	// getPlugin('array', 'times', new Set(['from']), true),
];

export const mathPlugins = [
	getPlugin('math', 'ceil', new Set(['ceil']), true),
	getPlugin('math', 'floor', new Set(['floor']), true),
	getPlugin('math', 'max', new Set(['max']), true),
	getPlugin('math', 'min', new Set(['min']), true),
	getPlugin('math', 'round', new Set(['round']), true),
];

export const miscPlugins = [
	tryCatchPlugin,
	getPlugin('number', 'getNumber', new Set(['Number']), true, true),
	getPlugin('promise', 'promises', new Set(['all', 'allSettled']), true),
	getPlugin('value', 'clone', new Set(['structuredClone']), true, true),
	getPlugin('value', 'equal', new Set(['is']), true),
];

export const stringPlugins = [
	getStringPlugin,
	getPlugin('string', 'endsWith', new Set(['endsWith'])),
	getPlugin('string', 'includes', new Set(['includes'])),
	getPlugin('string', 'lowerCase', new Set(['toLowerCase'])),
	getPlugin('string', 'startsWith', new Set(['startsWith'])),
	getPlugin('string', 'upperCase', new Set(['toUpperCase'])),
];

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */
export default eslintCompatPlugin({
	configs: {},
	meta: {
		name: '@oscarpalmer/atoms',
		version: pkg.version,
	},
	rules: {
		...groupBy(arrayPlugins, 'name', 'value'),
		...groupBy(mathPlugins, 'name', 'value'),
		...groupBy(miscPlugins, 'name', 'value'),
		...groupBy(stringPlugins, 'name', 'value'),
	},
});
