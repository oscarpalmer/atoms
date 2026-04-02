import arrayExistsPlugin from './array/array.exists.plugin.js';
import arraySortPlugin from './array/array.sort.plugin.js';

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */
export default {
	configs: {},
	meta: {
		name: '@oscarpalmer/atoms',
		version: '1.0.0',
	},
	rules: {
		[arrayExistsPlugin.name]: arrayExistsPlugin.value,
		[arraySortPlugin.name]: arraySortPlugin.value,
	},
};
