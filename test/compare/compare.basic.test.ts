import {expect, test} from 'vitest';
import {compare} from '../../src';

test('', () => {
	expect(compare(null, null)).toBe(0);
	expect(compare(null, 123)).toBe(-1);
	expect(compare(123, null)).toBe(1);
	expect(compare(123, 123)).toBe(0);

	expect(compare(0n, 0n)).toBe(0);
	expect(compare(0n, 1n)).toBe(-1);
	expect(compare(1n, 0n)).toBe(1);

	expect(compare(false, false)).toBe(0);
	expect(compare(false, true)).toBe(-1);
	expect(compare(true, false)).toBe(1);

	expect(compare(0, 0)).toBe(0);
	expect(compare(0, 1)).toBe(-1);
	expect(compare(1, 0)).toBe(1);

	expect(compare('a', 'a')).toBe(0);
	expect(compare('a', 'b')).toBe(-1);
	expect(compare('b', 'a')).toBe(1);

	expect(compare(Symbol('a'), Symbol('a'))).toBe(0);
	expect(compare(Symbol.for('a'), Symbol.for('a'))).toBe(0);
	expect(compare(Symbol('a'), Symbol('b'))).toBe(-1);
	expect(compare(Symbol('b'), Symbol('a'))).toBe(1);
	expect(compare(Symbol(), Symbol())).toBe(0);

	expect(compare(new Date('2000-01-01'), new Date('2000-01-01'))).toBe(0);
	expect(compare(new Date('2000-01-01'), new Date('2000-01-02'))).toBe(-1);
	expect(compare(new Date('2000-01-02'), new Date('2000-01-01'))).toBe(1);

	expect(compare({}, {})).toBe(0);
	expect(compare({a: 1}, {a: 1})).toBe(0);
	expect(compare({a: 1}, {a: 2})).toBe(-1);
	expect(compare({a: 2}, {a: 1})).toBe(1);

	expect(compare(1, 'a')).toBe(-1);
	expect(compare('a', 1)).toBe(1);

	expect(compare('a', 'a')).toBe(0);
	expect(compare('a', 'b')).toBe(-1);
	expect(compare('b', 'a')).toBe(1);

	expect(compare('a b c 1 2 3', 'a b c 1 2 3')).toBe(0);
	expect(compare('a b c 1 2 3', 'a b c 1 2 4')).toBe(-1);
	expect(compare('a b c 1 2 4', 'a b c 1 2 3')).toBe(1);

	expect(compare(['a', null], ['a', 'b'])).toBe(-1);
	expect(compare(['a', ''], ['a', 'b'])).toBe(-1);
	expect(compare(['a', 'b'], ['a', ''])).toBe(1);
	expect(compare(['a', 'b', 'c'], ['a', Symbol('b'), 'd'])).toBe(-1);

	expect(compare(['a', 1], ['a', '1'])).toBe(0);
	expect(compare(['a', 1], ['a', 2])).toBe(-1);
	expect(compare(['a', 2], ['a', 1])).toBe(1);

	expect(compare(['a', 1], ['b', 1])).toBe(-1);
	expect(compare(['b', 1], ['a', 1])).toBe(1);

	expect(compare(['a', 1], ['a', 'x'])).toBe(-1);
	expect(compare(['a', 'x'], ['a', 1])).toBe(1);

	expect(compare(['a', 'NaN'], ['a', 'NaN'])).toBe(0);
});
