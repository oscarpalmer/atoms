const date = new Date();

const query = {
	complex: {
		basic: 'a.0=1&a.1=2&a.2=3&b.0=x&b.1=true&b.2=99&c.0=H&c.1=e&c.2=l&c.3=l&c.4=o&d.e=f',
		bracketed: 'a[]=1&a[]=2&a[]=3&b[]=x&b[]=true&b[]=99&c[]=H&c[]=e&c[]=l&c[]=l&c[]=o&d.e=f',
	},
	date: `full=${date.toJSON()}&partial=2025-01-01`,
	ignored: '__proto__=ignored&nested.prototype=ignored&constructor=ignored',
	objects: '',
	simple: 'a=123&b=Hello%20World&c=true&d=1_2_3',
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
		a: 123,
		b: 'Hello World',
		c: true,
		d: '1_2_3',
	},
};

export const queryFixture = {
	query,
	parameters,
};
