import {groupBy} from '../dist/array/group-by.mjs';
import array from './array.js';

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
		...groupBy(array, 'name', 'value'),
	},
};
