import {defineConfig} from 'oxlint';

export default defineConfig({
	jsPlugins: ['./plugin/index.js'],
	rules: {
		'@oscarpalmer/atoms/array.exists': 'warn',
		'@oscarpalmer/atoms/array.sort': 'warn',
	},
});
