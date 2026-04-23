import {expect, test} from 'vitest';
import {indexOf, lastIndexOf} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const duplicates = [3, 3, 3, 3, 3];

test('first', () => {
	const {complex, simple} = arrayFixture;

	expect(indexOf(simple, 2)).toBe(1);
	expect(indexOf(simple, 10)).toBe(-1);

	const indexOfByKeyCallback = indexOf(complex, item => item.id, 3);
	const indexOfByKeyValue = indexOf(complex, 'id', 3);

	expect(indexOfByKeyCallback).toEqual(2);
	expect(indexOfByKeyValue).toEqual(2);

	const indexOfByValueCallback = indexOf(complex, item => item.id === 3);

	expect(indexOfByValueCallback).toEqual(2);

	expect(indexOf(duplicates, 3)).toBe(0);

	expect(indexOf(complex, 'id', 99)).toBe(-1);
	expect(indexOf('blah' as never, 99)).toBe(-1);
	expect(indexOf([], 99)).toBe(-1);
});

test('last', () => {
	const {complex, simple} = arrayFixture;

	expect(indexOf.last(simple, 2)).toBe(1);
	expect(indexOf.last(simple, 10)).toBe(-1);

	const indexOfByKeyCallback = indexOf.last(complex, item => item.id, 3);
	const indexOfByKeyValue = indexOf.last(complex, 'id', 3);

	expect(indexOfByKeyCallback).toEqual(2);
	expect(indexOfByKeyValue).toEqual(2);

	const indexOfByValueCallback = indexOf.last(complex, item => item.id === 3);

	expect(indexOfByValueCallback).toEqual(2);

	expect(indexOf.last(duplicates, 3)).toBe(4);

	expect(lastIndexOf(complex, 'id', 99)).toBe(-1);
	expect(lastIndexOf('blah' as never, 99)).toBe(-1);
	expect(lastIndexOf([], 99)).toBe(-1);
});
