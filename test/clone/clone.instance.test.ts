import {expect, test} from 'vitest';
import {clone, copy, deregisterCloner, isPlainObject} from '../../src';
import {TestCloneItem} from '../.fixtures/clone.fixture';

test('instance', () => {
	const original = new TestCloneItem(1, 'Hello');

	let cloned = clone(original);
	let copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);
	expect(copied).toBe(original);

	clone.register(TestCloneItem);

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('clone');
	expect(copied).toBe(original);

	clone.register(TestCloneItem, 'custom');

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('custom');
	expect(copied).toBe(original);

	clone.register(TestCloneItem, value => new TestCloneItem(value.id, 'callback'));

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('callback');
	expect(copied).toBe(original);

	clone.deregister(TestCloneItem);

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);
	expect(copied).toBe(original);

	clone.register(TestCloneItem, 'nonExistentMethod');

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);
	expect(copied).toBe(original);

	deregisterCloner(TestCloneItem);

	clone.register(TestCloneItem, clone);

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);
	expect(copied).toBe(original);

	clone.register(TestCloneItem, 123 as never);

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);
	expect(copied).toBe(original);

	clone.register(123 as never, 'custom');

	cloned = clone(original);
	copied = copy(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);
	expect(copied).toBe(original);

	clone.deregister(123 as never);
});
