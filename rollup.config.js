import typescript from '@rollup/plugin-typescript';

const configuration = {
	input: './src/js/index.ts',
	output: {
		file: './dist/js/index.js',
	},
	plugins: [typescript()],
	watch: {
		include: 'src/js/**',
	},
};

export default configuration;
