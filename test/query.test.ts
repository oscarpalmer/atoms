import {expect, test} from 'vitest';
import {fromQuery, toQuery, tryDecode, tryEncode} from '../src';
import {queryFixture} from './.fixtures/query.fixture';

const {query, parameters} = queryFixture;

test('fromQuery', () => {
	expect(fromQuery(`${query.simple}&${query.ignored}`)).toEqual(parameters.simple);

	expect(fromQuery(`${query.complex.basic}&${query.ignored}`)).toEqual(parameters.complex);

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
