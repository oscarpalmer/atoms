import {defineConfig} from 'vite-plus/pack';

export default defineConfig({
	copy: [
		{
			from: './dist/index.mjs',
			to: './dist',
			rename: 'atoms.full.mjs',
		},
	],
	deps: {
		onlyBundle: false,
		resolveDepSubpath: true,
	},
	clean: true,
	entry: './src/index.ts',
	minify: 'dce-only',
});
