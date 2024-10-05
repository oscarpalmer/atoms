const {globSync} = require('node:fs');

const entries = globSync('./src/js/**/*.ts').map(file => ({
	filePath: `${__dirname}/${file}`,
	libraries: {
		inlinedLibraries: ['type-fest'],
	},
	noCheck: true,
	outFile: `${__dirname}/types/${file.replace('src/js/', '').replace('.ts', '.d.cts')}`,
}));

module.exports = {
	entries,
	compilationOptions: {
		preferredConfigPath: `${__dirname}/tsconfig.json`,
	},
};
