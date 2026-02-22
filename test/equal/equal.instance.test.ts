import {expect, test} from 'vitest';
import {equal, registerEqualizer, unregisterEqualizer} from '../../src/internal/value/equal';
import {TestEqualItem} from '../.fixtures/equal.fixture';

test('instance', () => {
	function compare(first: TestEqualItem, second: TestEqualItem): boolean {
		return first.value === second.value;
	}

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	registerEqualizer(TestEqualItem, compare);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(true);
	expect(equal(new TestEqualItem(123), new TestEqualItem(456))).toBe(false);

	unregisterEqualizer(TestEqualItem);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	registerEqualizer(compare as never, compare);
	registerEqualizer('blah' as never, compare);

	registerEqualizer(TestEqualItem, 'blah' as never);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	unregisterEqualizer(compare as never);
	unregisterEqualizer('blah' as never);
});
