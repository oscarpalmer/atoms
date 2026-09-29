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
		deps: {
			// tsdown <0.23 compatibility: resolve external dependency subpaths.
			// Remove to preserve subpath imports as written (the new default).
			// https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
			resolveDepSubpath: true,
		},
		dts: {
			generator: 'oxc',
		},
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
