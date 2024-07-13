import * as fs from 'node:fs/promises';

const allowed = ['focusable.ts', 'index.ts', 'models.ts'];
const directory = String(__dirname).replace(/\\/g, '/');
const isMjs = process.argv.includes('--mjs');

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
	for (const file of files) {
		const parts = file.split('/');

		if (
			(!isMjs &&
				parts.length > 4 &&
				!allowed.includes(parts.at(-1) as string)) ||
			(!isMjs && file.endsWith('models.ts'))
		) {
			continue;
		}

		await Bun.build({
			entrypoints: [`${directory}/${file}`],
			external: isMjs ? ['*'] : [],
			naming: isMjs ? '[dir]/[name].mjs' : undefined,
			outdir: './dist/js',
			root: './src/js',
		});
	}
});
