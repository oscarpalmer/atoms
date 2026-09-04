import {expect, test} from 'vitest';
import {clone, initializeCloner} from '../../src';

test('', () => {
	const cloner = initializeCloner({
		copyFunctions: true,
	});

	expect(cloner).toBeTypeOf('function');
	expect(cloner.deregister).toBeTypeOf('function');
	expect((cloner as any).initialize).toBeUndefined();
	expect(cloner.register).toBeTypeOf('function');

	const fn = () => {};

	expect(cloner(fn)).toBe(fn);

	expect(clone.initialize()(fn)).not.toBe(fn);
});
