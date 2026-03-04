import {expect, test} from 'vitest';
import {assert} from '../../src/function/assert';
import {TestFunctionItem, testIsString} from '../.fixtures/function.fixture';

test('assert', () => {
	expect(() => assert(() => testIsString('test'), 'Value is not a string!')).not.toThrow();

	expect(() => assert(() => testIsString(123), 'Value is not a string!')).toThrow(
		'Value is not a string!',
	);

	expect(() => assert(() => testIsString(123), 'Value is not a string!', TypeError)).toThrow(
		TypeError,
	);
});

test('assert.condition', () => {
	const assertString = assert.condition(testIsString, 'Value is not a string!');

	expect(() => assertString('test')).not.toThrow();
	expect(() => assertString(123)).toThrow('Value is not a string!');

	const assertStringWithType = assert.condition(testIsString, 'Value is not a string!', TypeError);

	expect(() => assertStringWithType('test')).not.toThrow();
	expect(() => assertStringWithType(123)).toThrow(TypeError);
});

test('assert.defined', () => {
	expect(() => assert.defined('test')).not.toThrow();
	expect(() => assert.defined(null)).toThrow('Expected value to be defined');
	expect(() => assert.defined(undefined)).toThrow('Expected value to be defined');

	expect(() => assert.defined(null, 'Value is null!')).toThrow('Value is null!');
	expect(() => assert.defined(undefined, 'Value is undefined!')).toThrow('Value is undefined!');
});

test('assert.instanceOf', () => {
	const assertItem = assert.instanceOf(
		TestFunctionItem,
		'Value is not an instance of TestFunctionItem!',
	);

	expect(() => assertItem(new TestFunctionItem())).not.toThrow();
	expect(() => assertItem({})).toThrow('Value is not an instance of TestFunctionItem!');

	const assertItemWithType = assert.instanceOf(
		TestFunctionItem,
		'Value is not an instance of TestFunctionItem!',
		TypeError,
	);

	expect(() => assertItemWithType(new TestFunctionItem())).not.toThrow();
	expect(() => assertItemWithType({})).toThrow(TypeError);
});

test('assert.is', () => {
	const assertString = assert.is(testIsString, 'Value is not a string!');

	expect(() => assertString('test')).not.toThrow();
	expect(() => assertString(123)).toThrow('Value is not a string!');

	const assertStringWithType = assert.is(testIsString, 'Value is not a string!', TypeError);

	expect(() => assertStringWithType('test')).not.toThrow();
	expect(() => assertStringWithType(123)).toThrow(TypeError);
});
