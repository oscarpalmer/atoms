import {defineConfig} from 'oxlint';
import rules from './plugin/rules.js';

export default defineConfig({
	jsPlugins: ['./plugin/index.js'],
	rules: {
		...rules,
	},
});
