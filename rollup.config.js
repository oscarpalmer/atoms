import pluginNodeResolve from '@rollup/plugin-node-resolve';
import pluginTypescript from '@rollup/plugin-typescript';
import tsConfig from './tsconfig.json' with {type: 'json'};

tsConfig.compilerOptions = {
	...tsConfig.compilerOptions,
	allowImportingTsExtensions: false,
	declaration: false,
	declarationDir: undefined,
	emitDeclarationOnly: false,
};

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
	input: './src/index.ts',
	output: {
		file: './dist/atoms.full.js',
		format: 'es',
	},
	plugins: [pluginNodeResolve(), pluginTypescript(tsConfig)],
};
