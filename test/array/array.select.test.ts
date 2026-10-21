import {expect, test} from 'vite-plus/test';
import {reverseSelect, select} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

type Circle = {kind: 'circle'; radius: number};

type Square = {kind: 'square'; size: number};

type Shape = Circle | Square;

const shapes: Shape[] = [
	{kind: 'circle', radius: 1},
	{kind: 'square', size: 2},
	{kind: 'circle', radius: 3},
];

const isCircle = (shape: Shape): shape is Circle => shape.kind === 'circle';

test('select', () => {
	expect(
		select(
			arrayFixture.simple,
			item => item < 3,
			item => item * 2,
		),
	).toEqual([2, 4]);

	expect(
		select(
			arrayFixture.complex,
			item => item.age === 30,
			item => item.name,
		),
	).toEqual(['Bob', 'Alice']);

	expect(
		select(
			arrayFixture.simple,
			(_, index) => index % 2 === 0,
			(item, index, array) => `${item}/${index}/${array.length}`,
		),
	).toEqual(['1/0/5', '3/2/5', '5/4/5']);

	expect(
		select(
			arrayFixture.simple,
			item => item > 3,
			() => undefined,
		),
	).toEqual([undefined, undefined]);

	expect(
		select(
			arrayFixture.simple,
			() => false,
			item => item,
		),
	).toEqual([]);

	expect(
		select(
			'blah' as never,
			() => true,
			item => item,
		),
	).toEqual([]);
});

test('select.flat', () => {
	expect(
		select.flat(
			arrayFixture.complex,
			item => item.age > 30,
			item => [item.id, item.name],
		),
	).toEqual([3, 'Charlie', 5, 'David']);

	expect(
		select.flat(
			arrayFixture.simple,
			item => item < 4,
			item => (item === 2 ? [item, item] : item),
		),
	).toEqual([1, 2, 2, 3]);

	expect(
		select.flat(
			arrayFixture.simple,
			item => item === 1,
			() => [[1], [2]],
		),
	).toEqual([[1], [2]]);

	expect(
		select.flat(
			'blah' as never,
			() => true,
			item => item,
		),
	).toEqual([]);
});

test('reverse', () => {
	expect(
		select.reverse(
			arrayFixture.simple,
			item => item * 2,
			value => value < 5,
		),
	).toEqual([2, 4]);

	expect(
		reverseSelect(
			arrayFixture.complex,
			item => item.age,
			value => value === 30,
		),
	).toEqual([30, 30]);

	expect(
		reverseSelect(
			arrayFixture.simple,
			item => item * 10,
			(_, index, array) => index === array.length - 1,
		),
	).toEqual([50]);

	expect(
		reverseSelect(
			arrayFixture.simple,
			item => (item % 2 === 0 ? undefined : item),
			value => value === undefined,
		),
	).toEqual([undefined, undefined]);

	expect(
		select.reverse(
			'blah' as never,
			item => item,
			() => true,
		),
	).toEqual([]);
});

test('reverse.flat', () => {
	expect(
		reverseSelect.flat(
			arrayFixture.complex,
			item => [item.name, item.age],
			value => typeof value === 'string' && value.startsWith('A'),
		),
	).toEqual(['Alice', 'Alice']);

	expect(
		reverseSelect.flat(
			arrayFixture.complex,
			item => [item.id, item.age],
			(_, index) => index === 1,
		),
	).toEqual([2, 30]);

	expect(
		select.reverse.flat(
			arrayFixture.simple,
			item => item * 2,
			value => value > 6,
		),
	).toEqual([8, 10]);

	expect(
		reverseSelect.flat(
			'blah' as never,
			item => item,
			() => true,
		),
	).toEqual([]);
});

test('narrowing', () => {
	// Mappers and annotations below only compile if the type guard narrows
	const radii: number[] = select(shapes, isCircle, shape => shape.radius);

	expect(radii).toEqual([1, 3]);

	const flatRadii: number[] = select.flat(shapes, isCircle, shape => [
		shape.radius,
		shape.radius * 2,
	]);

	expect(flatRadii).toEqual([1, 2, 3, 6]);

	const sizes: number[] = select.reverse(
		shapes,
		shape => (shape.kind === 'square' ? shape.size : null),
		(value): value is number => value != null,
	);

	expect(sizes).toEqual([2]);

	const values: number[] = reverseSelect.flat(
		shapes,
		shape => (shape.kind === 'circle' ? [shape.radius, null] : [shape.size]),
		(value): value is number => value !== null,
	);

	expect(values).toEqual([1, 2, 3]);

	const evens: number[] = reverseSelect(
		arrayFixture.simple,
		item => (item % 2 === 0 ? item : null),
		value => value != null,
	);

	expect(evens).toEqual([2, 4]);
});
