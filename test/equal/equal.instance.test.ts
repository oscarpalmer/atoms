import {expect, test} from 'vite-plus/test';
import {deregisterEqualizer, equal, registerEqualizer} from '../../src';
import {TestEqualItem} from '../.fixtures/equal.fixture';

test('instance', () => {
	expect(deregisterEqualizer).toBe(equal.deregister);
	expect(registerEqualizer).toBe(equal.register);

	function compare(first: TestEqualItem, second: TestEqualItem): boolean {
		return first.value === second.value;
	}

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	registerEqualizer(TestEqualItem, compare);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(true);
	expect(equal(new TestEqualItem(123), new TestEqualItem(456))).toBe(false);

	deregisterEqualizer(TestEqualItem);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	registerEqualizer(compare as never, compare);
	registerEqualizer('blah' as never, compare);

	registerEqualizer(TestEqualItem, 'blah' as never);

	expect(equal(new TestEqualItem(123), new TestEqualItem(123))).toBe(false);

	deregisterEqualizer(compare as never);

	deregisterEqualizer('blah' as never);
});
