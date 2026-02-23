import {expect, test} from 'vitest';
import {diff} from '../../src';
import {TestValueDiffable, TestValueDiffableExtended} from '../.fixtures/value.fixture';

test('diff', () => {
	expect(diff(null, null).type).toBe('none');
	expect(diff(undefined, undefined).type).toBe('none');

	expect(diff(null, undefined).type).toBe('full');
	expect(diff(null, undefined, {relaxedNullish: true}).type).toBe('none');

	expect(diff(1, 1).type).toBe('none');
	expect(diff(1, 2).type).toBe('full');

	expect(diff('a', 'a').type).toBe('none');
	expect(diff('a', 'b').type).toBe('full');

	expect(diff([1, 2, 3], undefined).type).toBe('full');
	expect(diff([1, 2, 3], [3, 2, 1]).type).toBe('partial');
	expect(diff([1, 2, 3], [1, 2, 3]).type).toBe('none');

	const first: TestValueDiffable = {
		numbers: Array.from({length: 10}).map((_, i) => i),
		object: {
			nested: {
				a: 1,
				b: 2,
				c: 3,
			},
		},
		strings: Array.from({length: 10}).map((_, i) => String(i)),
		value: 123,
	};

	const second: TestValueDiffableExtended = {
		additional: 'xyz',
		numbers: Array.from({length: 10}).map((_, i) => (i % 3 === 0 ? -1 : i)),
		object: {
			nested: {
				a: 3,
				b: 2,
				c: 1,
			},
		},
		strings: Array.from({length: 10}).map((_, i) => String(i % 3 === 0 ? -1 : i)),
		value: 456,
	};

	const diffed = diff(first, second);

	expect(diffed.type).toBe('partial');
	expect(Object.keys(diffed.values).length).toBe(16);

	expect(diffed.values.numbers).toEqual({
		from: first.numbers,
		to: second.numbers,
	});

	expect(diffed.values.object).toEqual({from: first.object, to: second.object});

	expect(diffed.values['object.nested']).toEqual({
		from: first.object.nested,
		to: second.object.nested,
	});

	expect(diffed.values.strings).toEqual({
		from: first.strings,
		to: second.strings,
	});

	expect(diffed.values['numbers.0']).toEqual({from: 0, to: -1});
	expect(diffed.values['numbers.3']).toEqual({from: 3, to: -1});
	expect(diffed.values['numbers.6']).toEqual({from: 6, to: -1});
	expect(diffed.values['numbers.9']).toEqual({from: 9, to: -1});

	expect(diffed.values['strings.0']).toEqual({from: '0', to: '-1'});
	expect(diffed.values['strings.3']).toEqual({from: '3', to: '-1'});
	expect(diffed.values['strings.6']).toEqual({from: '6', to: '-1'});
	expect(diffed.values['strings.9']).toEqual({from: '9', to: '-1'});

	expect(diffed.values.value).toEqual({from: 123, to: 456});
	expect(diffed.values.additional).toEqual({from: undefined, to: 'xyz'});

	let arrays = diff([1, 2, 3], [1, 2, 3, 4, 5]);

	expect(arrays.type).toBe('partial');

	expect(arrays.values).toEqual({
		'3': {from: undefined, to: 4},
		'4': {from: undefined, to: 5},
	});

	arrays = diff([1, 2, 3, 4, 5], [1, 2, 3]);

	expect(arrays.type).toBe('partial');

	expect(arrays.values).toEqual({
		'3': {from: 4, to: undefined},
		'4': {from: 5, to: undefined},
	});

	let nullish = diff(
		{
			a: {
				b: {
					c: 123,
				},
			},
			nullish: null,
		},
		{
			a: {
				x: 'y',
			},
			nullish: undefined,
		},
	);

	expect(nullish.type).toBe('partial');

	expect(nullish.values['a.b.c']).toEqual({from: 123, to: undefined});
	expect(nullish.values['a.x']).toEqual({from: undefined, to: 'y'});
	expect(nullish.values.nullish).toEqual({from: null, to: undefined});

	nullish = diff(
		{
			a: {
				b: {
					c: 123,
				},
			},
			nullish: null,
		},
		{
			a: {
				x: 'y',
			},
			nullish: undefined,
		},
		{
			relaxedNullish: true,
		},
	);

	expect(nullish.type).toBe('partial');
	expect(nullish.values.relaxedNull).toBeUndefined();
});
