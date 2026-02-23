import {expect, test} from 'vitest';
import {compare} from '../../src';

test('', () => {
	class Test {
		constructor(readonly value: number[]) {}

		compare(other: Test): number {
			return compare(this.value, other.value);
		}

		length(other: Test): number {
			return compare(this.value.length, other.value.length);
		}
	}

	let alpha = new Test([1, 2, 3, 4, 5, 6]);
	let omega = new Test([7, 8, 9]);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.register(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.unregister(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.register(Test, (first, second): number =>
		compare(first.value.length, second.value.length),
	);

	expect(compare(alpha, omega)).toBe(1);
	expect(compare(omega, alpha)).toBe(-1);

	compare.unregister(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.register(Test, 'length');

	expect(compare(alpha, omega)).toBe(1);
	expect(compare(omega, alpha)).toBe(-1);

	compare.unregister(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.register(Test, compare);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.unregister(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.register(Test, 'nonExistentMethod');

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.unregister(Test);

	compare.register('blah' as never, compare);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	compare.register(Test, [1, 2, 3] as never);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);
});
