import {expect, test} from 'vitest';
import {clone, initializeCloner} from '../../src';

test('', () => {
	const cloner = initializeCloner({
		copyFunctions: true,
	});

	expect(cloner).toBeTypeOf('object');
	expect(cloner.clone).toBeTypeOf('function');
	expect(cloner.deregister).toBeTypeOf('function');
	expect((cloner as any).initialize).toBeUndefined();
	expect(cloner.register).toBeTypeOf('function');

	const fn = () => {};

	expect(cloner.clone(fn)).toBe(fn);

	expect(clone.initialize().clone(fn)).not.toBe(fn);
});
