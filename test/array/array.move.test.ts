import {expect, test} from 'vitest';
import {move} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('complex', () => {
	for (let index = 0; index < arrayFixture.move.complex.cases.length; index += 1) {
		const {array, key, parameters, result} = arrayFixture.move.complex.cases[index];

		expect(
			move(
				array ?? arrayFixture.move.complex.values.slice(),
				parameters.first,
				parameters.second,
				arrayFixture.move.keys[key] as never,
			),
		).toEqual(result);
	}
});

test('indices', () => {
	for (let index = 0; index < arrayFixture.move.indices.cases.length; index += 1) {
		const {array, parameters, result} = arrayFixture.move.indices.cases[index];

		expect(
			move.indices(
				array ?? arrayFixture.move.indices.values.slice(),
				parameters.first as never,
				parameters.second as never,
			),
		).toEqual(result);
	}
});

test('simple', () => {
	for (let index = 0; index < arrayFixture.move.simple.cases.length; index += 1) {
		const {array, parameters, result} = arrayFixture.move.simple.cases[index];

		expect(
			move(
				array ?? arrayFixture.move.simple.values.slice(),
				parameters.first as never,
				parameters.second as never,
			),
		).toEqual(result);
	}
});

test('toIndex', () => {
	for (let index = 0; index < arrayFixture.move.toIndex.cases.length; index += 1) {
		const {array, parameters, result} = arrayFixture.move.toIndex.cases[index];

		expect(
			move.toIndex(
				array ?? arrayFixture.move.toIndex.values.slice(),
				parameters.first as never,
				parameters.second as never,
			),
		).toEqual(result);
	}
});
