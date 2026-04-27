import {defineConfig} from 'vite-plus';
import rules from './plugin/rules.js';

export default defineConfig({
	base: './',
	fmt: {
		arrowParens: 'avoid',
		bracketSpacing: false,
		singleQuote: true,
		useTabs: true,
	},
	lint: {
		jsPlugins: ['./plugin/index.js'],
		rules: {
			...rules,
		},
	},
	logLevel: 'silent',
	pack: {
		dts: true,
		entry: ['./src/**/*.ts'],
		unbundle: true,
	},
	test: {
		coverage: {
			include: ['src/**/*.ts'],
			provider: 'istanbul',
		},
		environment: 'jsdom',
		watch: false,
	},
});
