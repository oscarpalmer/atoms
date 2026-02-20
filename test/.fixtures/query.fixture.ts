const date = new Date();

const query = {
	complex: {
		basic: 'a=1&a=2&a=3&b=x&b=true&b=99&c=H&c=e&c=l&c=l&c=o&d.e=f',
		bracketed: 'a[]=1&a[]=2&a[]=3&b=x&b=true&b=99&c=H&c=e&c=l&c=l&c=o&d.e=f',
	},
	date: `full=${date.toJSON()}&partial=2025-01-01`,
	ignored: '__proto__=ignored&nested.prototype=ignored&constructor=ignored',
	objects: '',
	simple: 'a=1&b=Hello%20World&c=true',
};

const parameters = {
	complex: {
		a: [1, 2, 3],
		b: ['x', true, 99],
		c: ['H', 'e', 'l', 'l', 'o'],
		d: {e: 'f'},
	},
	date: {
		full: date,
		partial: '2025-01-01',
	},
	objects: {
		map: new Map([
			['a', 1],
			['b', 2],
		]),
		set: new Set([1, 2, 3]),
	},
	simple: {
		a: 1,
		b: 'Hello World',
		c: true,
	},
};

export const queryFixture = {
	query,
	parameters,
};
