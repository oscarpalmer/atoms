import {expect, test} from 'vite-plus/test';
import {noop} from '../../src';

test('', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});
