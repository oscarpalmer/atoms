import {expect, test} from 'bun:test';
import {memoise, noop} from '../src/js/function';

test('memoise', () => {
	const memoised = memoise((value: number) => value * 2);

	expect(memoised.has(2)).toBe(false);
	expect(memoised.has(3)).toBe(false);
	expect(memoised.get(2)).toBeUndefined();
	expect(memoised.get(3)).toBeUndefined();

	expect(memoised.run(2)).toBe(4);
	expect(memoised.run(3)).toBe(6);

	expect(memoised.has(2)).toBe(true);
	expect(memoised.has(3)).toBe(true);
	expect(memoised.get(2)).toBe(4);
	expect(memoised.get(3)).toBe(6);

	memoised.delete(2);

	expect(memoised.has(2)).toBe(false);
	expect(memoised.has(3)).toBe(true);
	expect(memoised.get(2)).toBeUndefined();
	expect(memoised.get(3)).toBe(6);

	memoised.clear();

	expect(memoised.has(2)).toBe(false);
	expect(memoised.has(3)).toBe(false);
	expect(memoised.get(2)).toBeUndefined();
	expect(memoised.get(3)).toBeUndefined();
});

test('noop', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop.toString()).toMatch(/\s*function\s*noop\(\)\s*\{\s*\}\s*/);
	expect(noop()).toBeUndefined();
});
