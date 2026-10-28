import {expect, test} from 'vite-plus/test';
import {noop} from '../../src';

test('function, noop', () => {
	expect(noop).toBeInstanceOf(Function);
	expect(noop()).toBeUndefined();
});
