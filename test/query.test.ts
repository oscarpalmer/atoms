import {expect, test} from 'vitest';
import {fromQuery, toQuery} from '../src/query';

const query = {
	complex: 'a=1&a=2&a=3&b=x&b=true&b=99&c=H&c=e&c=l&c=l&c=o&d.e=f',
	ignored: '__proto__=ignored&nested.prototype=ignored&constructor=ignored',
	simple: 'a=1&b=Hello%20World&c=true',
};

const parameters = {
	complex: {
		a: [1, 2, 3],
		b: ['x', true, 99],
		c: ['H', 'e', 'l', 'l', 'o'],
		d: {e: 'f'},
	},
	simple: {
		a: 1,
		b: 'Hello World',
		c: true,
	},
};

test('fromQuery', () => {
	expect(fromQuery(`${query.simple}&${query.ignored}`)).toEqual(
		parameters.simple,
	);

	expect(fromQuery(`${query.complex}&${query.ignored}`)).toEqual(
		parameters.complex,
	);
});

test('toQuery', () => {
	expect(toQuery(parameters.simple)).toBe(query.simple);
	expect(toQuery(parameters.complex)).toBe(query.complex);
});
