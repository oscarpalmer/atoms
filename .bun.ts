import {$} from 'bun';
import * as fs from 'node:fs/promises';

const allowed = ['index.ts', 'models.ts'];
const directory = String(__dirname).replace(/\\/g, '/');
const isEsm = process.argv.includes('--esm');

async function getFiles(path: string): Promise<string[]> {
	const entries = await fs.readdir(path, {withFileTypes: true});

	const files = entries
		.filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
		.map(file => `${path}/${file.name}`);

	const folders = entries.filter(entry => entry.isDirectory());

	for (const folder of folders) {
		files.push(...(await getFiles(`${path}/${folder.name}`)));
	}

	return files;
}

getFiles('./src/js').then(async files => {
	const names: string[] = [];

	console.log(`\n=== Building ${isEsm ? 'ESM' : 'CJS'} files`);

	for (const file of files) {
		const parts = file.split('/');

		if (
			!isEsm &&
			parts.length > 4 &&
			!allowed.includes(parts.at(-1) as string)
		) {
			continue;
		}

		if (file.endsWith('models.ts') ? isEsm : true) {
			await Bun.build({
				entrypoints: [`${directory}/${file}`],
				external: isEsm ? ['*'] : [],
				naming: isEsm ? '[dir]/[name].mjs' : undefined,
				outdir: './dist/js',
				root: './src/js',
			});
		}

		if (!isEsm) {
			names.push(file.replace('./src/js/', '').replace('.ts', ''));
		}
	}

	if (isEsm) {
		console.log('=== Building d.ts-types');

		await $`bunx tsc -p ./tsconfig.json`;
	}

	if (!isEsm) {
		console.log('=== Building d.cts-types');

		for (const name of names) {
			await $`bunx dts-bundle-generator --out-file ./types/${name}.d.cts --external-inlines 'type-fest' --no-check --silent ./src/js/${name}.ts`;
		}
	}

	console.log('=== Done');
});
