import {expect, test} from 'vitest';
import {isPlainObject} from '../../src/internal/is';
import {clone} from '../../src/value';
import {TestCloneItem} from '../.fixtures/clone.fixture';

test('instance', () => {
	const original = new TestCloneItem(1, 'Hello');

	let cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(TestCloneItem);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('clone');

	clone.register(TestCloneItem, 'custom');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('custom');

	clone.register(TestCloneItem, value => new TestCloneItem(value.id, 'callback'));

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(cloned).toBeInstanceOf(TestCloneItem);
	expect(cloned.id).toBe(original.id);
	expect(cloned.name).toBe('callback');

	clone.unregister(TestCloneItem);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(TestCloneItem, 'nonExistentMethod');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.unregister(TestCloneItem);

	clone.register(TestCloneItem, clone);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(TestCloneItem, 123 as never);

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.register(123 as never, 'custom');

	cloned = clone(original);

	expect(cloned).not.toBe(original);
	expect(isPlainObject(cloned)).toBe(true);

	clone.unregister(123 as never);
});
