import {expect, test} from 'vite-plus/test';
import {indexOf, lastIndexOf} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

const duplicates = [3, 3, 3, 3, 3];

test('indexOf', () => {
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

test('lastIndexOf', () => {
	expect(indexOf.last).toBe(lastIndexOf);

	const {complex, simple} = arrayFixture;

	expect(lastIndexOf(simple, 2)).toBe(1);
	expect(lastIndexOf(simple, 10)).toBe(-1);

	const indexOfByKeyCallback = lastIndexOf(complex, item => item.id, 3);
	const indexOfByKeyValue = lastIndexOf(complex, 'id', 3);

	expect(indexOfByKeyCallback).toEqual(2);
	expect(indexOfByKeyValue).toEqual(2);

	const indexOfByValueCallback = lastIndexOf(complex, item => item.id === 3);

	expect(indexOfByValueCallback).toEqual(2);

	expect(lastIndexOf(duplicates, 3)).toBe(4);

	expect(lastIndexOf(complex, 'id', 99)).toBe(-1);
	expect(lastIndexOf('blah' as never, 99)).toBe(-1);
	expect(lastIndexOf([], 99)).toBe(-1);
});
