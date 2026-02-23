import {expect, test} from 'vitest';
import {equal} from '../../src';
import {TestEqualItem} from '../.fixtures/equal.fixture';

test('instance', () => {
	function compare(first: TestEqualItem, second: TestEqualItem): boolean {
		return first.value === second.value;
	}

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	equal.register(TestEqualItem, compare);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(true);
	expect(equal(new TestEqualItem(123), new TestEqualItem(456))).toBe(false);

	equal.unregister(TestEqualItem);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	equal.register(compare as never, compare);
	equal.register('blah' as never, compare);

	equal.register(TestEqualItem, 'blah' as never);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	equal.unregister(compare as never);
	equal.unregister('blah' as never);
});
