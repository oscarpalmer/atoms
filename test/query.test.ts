import {expect, test} from 'vitest';
import {tryDecode, tryEncode} from '../src/internal/string/uri';
import {fromQuery, toQuery} from '../src/query';

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

test('fromQuery', () => {
	expect(fromQuery(`${query.simple}&${query.ignored}`)).toEqual(
		parameters.simple,
	);

	expect(fromQuery(`${query.complex.basic}&${query.ignored}`)).toEqual(
		parameters.complex,
	);

	expect(fromQuery(`${query.complex.basic}&${query.ignored}`)).toEqual(
		fromQuery(`${query.complex.bracketed}&${query.ignored}`),
	);

	expect(fromQuery(`${query.date}&${query.ignored}`)).toEqual(parameters.date);

	expect(fromQuery(`${query.objects}&${query.ignored}`)).toEqual({});

	expect(fromQuery(123 as never)).toEqual({});
});

test('toQuery', () => {
	expect(toQuery(parameters.simple)).toBe(query.simple);
	expect(toQuery(parameters.complex)).toBe(query.complex.basic);
	expect(toQuery(parameters.date)).toBe(query.date);
	expect(toQuery(parameters.objects)).toBe(query.objects);

	expect(toQuery(123 as never)).toBe('');
});

test('tryDecode + tryEncode', () => {
	expect(tryDecode('Hello%20World')).toBe('Hello World');
	expect(tryEncode('Hello World')).toBe('Hello%20World');
	expect(tryDecode('😄')).toBe('😄');
	expect(tryEncode('😄')).toBe('%F0%9F%98%84');

	expect(tryDecode('%%%%')).toBe('%%%%');
});
