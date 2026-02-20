import {expect, test} from 'vitest';
import {noop} from '../../src/internal/function';

test('', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});
