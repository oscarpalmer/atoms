export function ignoreKey(key: string): boolean {
	return ignoreExpression.test(key);
}

const ignoreExpression = /(^|\.)(__proto__|constructor|prototype)(\.|$)/i;
