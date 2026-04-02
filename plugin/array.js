import {getPlugin, isArrayMethod} from './helpers.js';

export default [
	getPlugin(
		{
			full: 'array.exists',
			short: 'exists',
		},
		new Set(['includes']),
		isArrayMethod,
		'Array.prototype',
	),
	getPlugin(
		{
			full: 'array.sort',
			short: 'sort',
		},
		new Set(['sort']),
		isArrayMethod,
		'Array.prototype',
	),
];
