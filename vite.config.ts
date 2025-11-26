/// <reference types="vitest" />
import {extname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {globSync} from 'tinyglobby';
import {defineConfig} from 'vite';

const files = globSync('./src/**/*.ts').map(file => [
	relative('./src', file.slice(0, file.length - extname(file).length)),
	fileURLToPath(new URL(file, import.meta.url)),
]);

export default defineConfig({
	base: './',
	build: {
		lib: {
			entry: [],
			formats: ['es'],
		},
		minify: false,
		outDir: './dist',
		rollupOptions: {
			input: Object.fromEntries(files),
			output: {
				preserveModules: true,
			},
		},
		target: 'esnext',
	},
	logLevel: 'silent',
	test: {
		coverage: {
			include: ['src/**/*.ts'],
			provider: 'istanbul',
		},
		environment: 'jsdom',
		watch: false,
	},
});
