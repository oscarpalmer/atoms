import {defineConfig} from 'tsdown';

export default defineConfig({
	clean: false,
	entry: './src/index.ts',
	minify: 'dce-only',
});
