import {expect, test} from 'vitest';
import {single} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	const {complex, simple} = arrayFixture;

	const singleByKeyCallback = single(complex, item => item.id === 3);
	const singleByKeyValue = single(complex, 'id', 3);

	expect(singleByKeyCallback).toEqual({id: 3, age: 35, name: 'Charlie'});
	expect(singleByKeyValue).toEqual({id: 3, age: 35, name: 'Charlie'});

	const singleByValueCallback = single(complex, item => item.id === 3);

	expect(singleByValueCallback).toEqual({id: 3, age: 35, name: 'Charlie'});

	expect(() => single(simple, item => item > 2)).toThrow();
	expect(() => single(complex, item => item.age > 30)).toThrow();

	expect(single(complex, 'id', 99)).toBeUndefined();
	expect(single('blah' as never, 99 as never)).toBeUndefined();
	expect(single([], 99 as never)).toBeUndefined();
});
