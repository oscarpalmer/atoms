import * as fs from 'fs/promises';

async function getFiles(path: string): Promise<string[]> {
	const entries = await fs.readdir(path, {withFileTypes: true});

	const files = entries
		.filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
		.map(file => `${path}${file.name}`);

	const folders = entries.filter(entry => entry.isDirectory());

	for (const folder of folders) {
		files.push(...(await getFiles(`${path}${folder.name}/`)));
	}

	return files;
}

getFiles('./src/js/').then(files =>
	Bun.build({
		entrypoints: files,
		outdir: './dist/js',
		root: './src/js',
	}),
);
