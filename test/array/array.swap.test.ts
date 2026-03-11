import {expect, test} from 'vitest';
import {swap} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('complex', () => {
	for (let index = 0; index < arrayFixture.swap.complex.cases.length; index += 1) {
		const {array, key, parameters, result} = arrayFixture.swap.complex.cases[index];

		expect(
			swap(
				array ?? arrayFixture.swap.complex.values.slice(),
				parameters.first,
				parameters.second,
				arrayFixture.swap.keys[key] as never,
			),
		).toEqual(result);
	}
});

test('indices', () => {
	for (let index = 0; index < arrayFixture.swap.indices.cases.length; index += 1) {
		const {array, parameters, result} = arrayFixture.swap.indices.cases[index];

		expect(
			swap.indices(
				array ?? arrayFixture.swap.indices.values.slice(),
				parameters.first as never,
				parameters.second as never,
			),
		).toEqual(result);
	}
});

test('simple', () => {
	for (let index = 0; index < arrayFixture.swap.simple.cases.length; index += 1) {
		const {array, parameters, result} = arrayFixture.swap.simple.cases[index];

		expect(
			swap(
				array ?? arrayFixture.swap.simple.values.slice(),
				parameters.first as never,
				parameters.second as never,
			),
		).toEqual(result);
	}
});
