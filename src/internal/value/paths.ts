export function getPaths(path: string, lowercase: boolean): string[] {
	return (lowercase ? path.toLowerCase() : path)
		.replace(bracketExpression, '.$1')
		.replace(dotsExpression, '')
		.split('.');
}

const bracketExpression = /\[(\w+)\]/g;
const dotsExpression = /^\.|\.$/g;
