import {expect, test} from 'vitest';
import {indexOf} from '../../src/array';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	expect(indexOf(simple, 2)).toBe(1);
	expect(indexOf(simple, 5)).toBe(-1);

	const indexOfByKeyCallback = indexOf(complex, item => item.id, 3);
	const indexOfByKeyValue = indexOf(complex, 'id', 3);

	expect(indexOfByKeyCallback).toEqual(2);
	expect(indexOfByKeyValue).toEqual(2);

	const indexOfByValueCallback = indexOf(complex, item => item.id === 3);

	expect(indexOfByValueCallback).toEqual(2);

	expect(indexOf(complex, 'id', 99)).toBe(-1);
	expect(indexOf('blah' as never, 99)).toBe(-1);
	expect(indexOf([], 99)).toBe(-1);
});
