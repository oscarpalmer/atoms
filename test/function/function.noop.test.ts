import {expect, test} from 'vitest';
import {noop} from '../../src';

test('', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});
