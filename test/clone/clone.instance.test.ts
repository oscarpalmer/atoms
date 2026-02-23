import {expect, test} from 'vitest';
import {clone, isPlainObject, registerCloner, unregisterCloner} from '../../src';
import {TestCloneItem} from '../.fixtures/clone.fixture';

test('instance', () => {
	const original = new TestCloneItem(1, 'Hello');

	let cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	registerCloner(TestCloneItem);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('clone');

	registerCloner(TestCloneItem, 'custom');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('custom');

	registerCloner(TestCloneItem, value => new TestCloneItem(value.id, 'callback'));

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('callback');

	unregisterCloner(TestCloneItem);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	registerCloner(TestCloneItem, 'nonExistentMethod');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	unregisterCloner(TestCloneItem);

	registerCloner(TestCloneItem, clone);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	registerCloner(TestCloneItem, 123 as never);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	registerCloner(123 as never, 'custom');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	unregisterCloner(123 as never);
});
