import {expect, test} from 'vitest';
import type {NestedPartial} from '../../src/models';
import {initializeMerger, merge} from '../../src/value';
import {TestValueMergeable} from '../.fixtures/value.fixture';

test('merge', () => {
	const first: NestedPartial<TestValueMergeable> = {
		age: 99,
		cars: ['Alfa Romeo Spider', 'Lamborghini Miura'],
		hobbies: ['Gaming', 'Reading'],
		name: {
			first: 'Oscar',
		},
		profession: 'Developer?',
	};

	const second: NestedPartial<TestValueMergeable> = {
		cars: undefined,
		name: {
			last: 'Palmér',
		},
	};

	const third: NestedPartial<TestValueMergeable> = {
		cars: ['Toyota 2000GT'],
	};

	const fourth: NestedPartial<TestValueMergeable> = {
		cars: ['Ferrari 250 GT California'],
		hobbies: ['Wrestling'],
	};

	const merger = initializeMerger({
		replaceableObjects: 'cars',
	});

	const merged = merger([first, second, third, fourth]);

	expect(merged).toEqual({
		age: 99,
		cars: ['Ferrari 250 GT California'],
		hobbies: ['Wrestling', 'Reading'],
		name: {
			first: 'Oscar',
			last: 'Palmér',
		},
		profession: 'Developer?',
	});

	expect(merge([])).toEqual({});
	expect(merge([{hello: 'world'}])).toEqual({hello: 'world'});

	expect(
		merge([
			{hello: {w: 'w'}},
			{hello: {o: 'o'}} as never,
			{hello: {r: 'r'}} as never,
			{hello: {l: 'l'}} as never,
			{hello: {d: 'd'}} as never,
		]),
	).toEqual({
		hello: {
			w: 'w',
			o: 'o',
			r: 'r',
			l: 'l',
			d: 'd',
		},
	});

	expect(
		merge([[1, 2, 3, 4, 5], [null, null, 99] as never], {
			skipNullableInArrays: true,
		}),
	).toEqual([1, 2, 99, 4, 5]);

	const replaceableFirst = {
		a: {
			b: {
				c: {
					d: [1, 2, 3],
					d2: ['x', 'y', 'z'],
				},
				c9x: {msg: '!', value: 99},
			},
			b2: ['a', 'b', 'c'],
			bx: {value: '?'},
		},
	};

	const replaceableSecond = {
		a: {
			b: {
				c: {
					d: [4, 5, 6],
					d2: ['å', 'ä', 'ö'],
				},
				c9x: {msg: '!!!'},
			},
			b2: ['d', 'e', 'f'],
		},
	};

	const replaceableMerged = merge([replaceableFirst, replaceableSecond], {
		replaceableObjects: [/c9x/, /\w\d$/],
	});

	expect(replaceableMerged).toEqual({
		a: {
			b: {
				c: {
					d: [4, 5, 6],
					d2: ['å', 'ä', 'ö'],
				},
				c9x: {msg: '!!!'},
			},
			b2: ['d', 'e', 'f'],
			bx: {value: '?'},
		},
	});

	expect(merge('blah' as never)).toEqual({});
	expect(merge(['blah' as never])).toEqual({});
});
