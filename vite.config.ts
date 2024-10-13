/// <reference types="vitest" />
import {dirname, extname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {globSync} from 'glob';
import {defineConfig} from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const watch = process.argv.includes('--watch');

const files = globSync(watch ? './src/js/index.ts' : './src/js/**/*.ts').map(
	file => [
		relative('./src/js', file.slice(0, file.length - extname(file).length)),
		fileURLToPath(new URL(file, import.meta.url)),
	],
);

export default defineConfig({
	base: './',
	build: {
		lib: {
			entry: [],
			formats: ['cjs', 'es'],
		},
		minify: false,
		outDir: './dist/js',
		rollupOptions: {
			input: Object.fromEntries(files),
			output: {
				generatedCode: 'es2015',
				preserveModules: true,
			},
		},
	},
	test: {
		coverage: {
			include: ['src/js/**/*.ts'],
			provider: 'istanbul',
		},
		environment: 'happy-dom',
		watch: false,
	},
	resolve: {
		alias: [{find: '~', replacement: resolve(__dirname, 'src/js')}],
	},
});
