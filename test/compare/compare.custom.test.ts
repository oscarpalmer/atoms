import {expect, test} from 'vitest';
import {compare, registerComparator, unregisterComparator} from '../../src/internal/value/compare';

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

	registerComparator(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	unregisterComparator(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	registerComparator(Test, (first, second): number =>
		compare(first.value.length, second.value.length),
	);

	expect(compare(alpha, omega)).toBe(1);
	expect(compare(omega, alpha)).toBe(-1);

	unregisterComparator(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	registerComparator(Test, 'length');

	expect(compare(alpha, omega)).toBe(1);
	expect(compare(omega, alpha)).toBe(-1);

	unregisterComparator(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	registerComparator(Test, compare);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	unregisterComparator(Test);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	registerComparator(Test, 'nonExistentMethod');

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	unregisterComparator(Test);

	registerComparator('blah' as never, compare);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);

	registerComparator(Test, [1, 2, 3] as never);

	expect(compare(alpha, omega)).toBe(-1);
	expect(compare(omega, alpha)).toBe(1);
});
