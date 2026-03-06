import {expect, test} from 'vitest';
import {toggle} from '../../src';
import {arrayFixture, TestArrayItem} from '../.fixtures/array.fixture';

test('', () => {
	expect(toggle([], [1])).toEqual([1]);
	expect(toggle([1], [1])).toEqual([]);
	expect(toggle([1], [2])).toEqual([1, 2]);
	expect(toggle([1, 2], [])).toEqual([1, 2]);

	const complex: TestArrayItem[] = arrayFixture.complex.map(item => ({...item}));

	const eve: TestArrayItem = {id: 6, age: 40, name: 'Eve'};

	expect(toggle(complex, [arrayFixture.complex[2]], item => item.id)).toEqual([
		arrayFixture.complex[0],
		arrayFixture.complex[1],
		arrayFixture.complex[3],
		arrayFixture.complex[4],
	]);

	expect(toggle(complex, [eve], item => item.id)).toEqual([
		arrayFixture.complex[0],
		arrayFixture.complex[1],
		arrayFixture.complex[3],
		arrayFixture.complex[4],
		eve,
	]);

	expect(toggle(complex, [arrayFixture.complex[3]], 'id')).toEqual([
		arrayFixture.complex[0],
		arrayFixture.complex[1],
		arrayFixture.complex[4],
		eve,
	]);

	expect(toggle(complex, [arrayFixture.complex[3]], 'id')).toEqual([
		arrayFixture.complex[0],
		arrayFixture.complex[1],
		arrayFixture.complex[4],
		eve,
		arrayFixture.complex[3],
	]);

	expect(toggle('blah' as never, [1, 2, 3])).toEqual([]);
	expect(toggle([1, 2, 3], 'blah' as never)).toEqual([1, 2, 3]);
});
