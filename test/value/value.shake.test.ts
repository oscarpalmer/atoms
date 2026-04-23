import {expect, test} from 'vitest';
import {shake} from '../../src';

test('', () => {
	expect(
		shake({
			a: 123,
			b: 'abc',
			c: undefined,
			d: null,
			e: false,
			f: 0,
		}),
	).toEqual({
		a: 123,
		b: 'abc',
		d: null,
		e: false,
		f: 0,
	});

	expect(shake({})).toEqual({});
	expect(shake('blah' as never)).toEqual({});
});
