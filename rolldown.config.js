import {defineConfig} from 'rolldown';

export default defineConfig({
	experimental: {
		attachDebugInfo: 'none',
	},
	input: './src/index.ts',
	output: {
		file: './dist/atoms.full.js',
		minify: 'dce-only',
	},
});
