import {expect, test} from 'vite-plus/test';
import {
	filterAndFlatMap,
	flatMapAndFilter,
	mapAndFilter,
	filterAndMap,
	select,
	reverseSelect,
} from '../../src';
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

test('aliases', () => {
	expect(select).toBe(filterAndMap);
	expect(select.reverse).toBe(mapAndFilter);
	expect(reverseSelect).toBe(mapAndFilter);

	expect(select.flat).toBe(filterAndFlatMap);
	expect(select.reverse.flat).toBe(flatMapAndFilter);
	expect(reverseSelect.flat).toBe(flatMapAndFilter);
});

test('filterAndMap', () => {
	expect(
		filterAndMap(
			arrayFixture.simple,
			item => item < 3,
			item => item * 2,
		),
	).toEqual([2, 4]);

	expect(
		filterAndMap(
			arrayFixture.complex,
			item => item.age === 30,
			item => item.name,
		),
	).toEqual(['Bob', 'Alice']);

	expect(
		filterAndMap(
			arrayFixture.simple,
			(_, index) => index % 2 === 0,
			(item, index, array) => `${item}/${index}/${array.length}`,
		),
	).toEqual(['1/0/5', '3/2/5', '5/4/5']);

	expect(
		filterAndMap(
			arrayFixture.simple,
			item => item > 3,
			() => undefined,
		),
	).toEqual([undefined, undefined]);

	expect(
		filterAndMap(
			arrayFixture.simple,
			() => false,
			item => item,
		),
	).toEqual([]);

	expect(
		filterAndMap(
			'blah' as never,
			() => true,
			item => item,
		),
	).toEqual([]);

	expect(filterAndMap([], (() => {}) as never, (() => {}) as never)).toEqual([]);
});

test('filterAndFlatMap', () => {
	expect(
		filterAndFlatMap(
			arrayFixture.complex,
			item => item.age > 30,
			item => [item.id, item.name],
		),
	).toEqual([3, 'Charlie', 5, 'David']);

	expect(
		filterAndFlatMap(
			arrayFixture.simple,
			item => item < 4,
			item => (item === 2 ? [item, item] : item),
		),
	).toEqual([1, 2, 2, 3]);

	expect(
		filterAndFlatMap(
			arrayFixture.simple,
			item => item === 1,
			() => [[1], [2]],
		),
	).toEqual([[1], [2]]);

	expect(
		filterAndFlatMap(
			'blah' as never,
			() => true,
			item => item,
		),
	).toEqual([]);
});

test('mapAndFilter', () => {
	expect(
		mapAndFilter(
			arrayFixture.simple,
			item => item * 2,
			value => value < 5,
		),
	).toEqual([2, 4]);

	expect(
		mapAndFilter(
			arrayFixture.complex,
			item => item.age,
			value => value === 30,
		),
	).toEqual([30, 30]);

	expect(
		mapAndFilter(
			arrayFixture.simple,
			item => item * 10,
			(_, index, array) => index === array.length - 1,
		),
	).toEqual([50]);

	expect(
		mapAndFilter(
			arrayFixture.simple,
			item => (item % 2 === 0 ? undefined : item),
			value => value === undefined,
		),
	).toEqual([undefined, undefined]);

	expect(
		mapAndFilter(
			'blah' as never,
			item => item,
			() => true,
		),
	).toEqual([]);
});

test('flatMapAndFilter', () => {
	expect(
		flatMapAndFilter(
			arrayFixture.complex,
			item => [item.name, item.age],
			value => typeof value === 'string' && value.startsWith('A'),
		),
	).toEqual(['Alice', 'Alice']);

	expect(
		flatMapAndFilter(
			arrayFixture.complex,
			item => [item.id, item.age],
			(_, index) => index === 1,
		),
	).toEqual([2, 30]);

	expect(
		flatMapAndFilter(
			arrayFixture.simple,
			item => item * 2,
			value => value > 6,
		),
	).toEqual([8, 10]);

	expect(
		flatMapAndFilter(
			'blah' as never,
			item => item,
			() => true,
		),
	).toEqual([]);
});

test('narrowing', () => {
	// Mappers and annotations below only compile if the type guard narrows
	const radii: number[] = filterAndMap(shapes, isCircle, shape => shape.radius);

	expect(radii).toEqual([1, 3]);

	const flatRadii: number[] = filterAndFlatMap(shapes, isCircle, shape => [
		shape.radius,
		shape.radius * 2,
	]);

	expect(flatRadii).toEqual([1, 2, 3, 6]);

	const sizes: number[] = mapAndFilter(
		shapes,
		shape => (shape.kind === 'square' ? shape.size : null),
		(value): value is number => value != null,
	);

	expect(sizes).toEqual([2]);

	const values: number[] = flatMapAndFilter(
		shapes,
		shape => (shape.kind === 'circle' ? [shape.radius, null] : [shape.size]),
		(value): value is number => value !== null,
	);

	expect(values).toEqual([1, 2, 3]);

	const evens: number[] = mapAndFilter(
		arrayFixture.simple,
		item => (item % 2 === 0 ? item : null),
		value => value != null,
	);

	expect(evens).toEqual([2, 4]);
});
