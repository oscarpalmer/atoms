import {expect, test} from 'vite-plus/test';
import {
	asyncFail,
	asyncSucceed,
	asyncUse,
	fail,
	isAsyncFailure,
	isAsyncGenerator,
	isAsyncGeneratorFunction,
	isAsyncPlan,
	isAsyncStep,
	isAsyncSuccess,
	isFailure,
	isGenerator,
	isGeneratorFunction,
	isPlan,
	isStep,
	isSuccess,
	plan,
	succeed,
	use,
} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';

const {length, values} = isFixture;

test('isAsyncFailure', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isAsyncFailure(values[index])).toBe(false);
	}

	const failure = asyncFail('error');

	expect(isAsyncFailure(failure)).toBe(true);
	expect(isFailure(failure)).toBe(false);
});

test('isAsyncGenerator', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isAsyncGenerator(values[index])).toBe(false);
	}

	const generator = async function* () {};

	expect(isAsyncGeneratorFunction(generator)).toBe(true);
	expect(isGeneratorFunction(generator)).toBe(false);

	const generated = generator();

	expect(isAsyncGenerator(generated)).toBe(true);
	expect(isGenerator(generated)).toBe(false);
});

test('isAsyncPlan', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isAsyncPlan(values[index])).toBe(false);
	}

	const planned = plan(async function* () {});

	expect(isAsyncPlan(planned)).toBe(true);
	expect(isPlan(planned)).toBe(false);
});

test('isAsyncStep', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isAsyncStep(values[index])).toBe(false);
	}

	const step = asyncUse('step');

	expect(isAsyncStep(step)).toBe(true);
	expect(isStep(step)).toBe(false);
});

test('isAsyncSuccess', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isAsyncSuccess(values[index])).toBe(false);
	}

	const success = asyncSucceed('step');

	expect(isAsyncSuccess(success)).toBe(true);
	expect(isSuccess(success)).toBe(false);
});

test('isFailure', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isFailure(values[index])).toBe(false);
	}

	const failure = fail('error');

	expect(isFailure(failure)).toBe(true);
	expect(isAsyncFailure(failure)).toBe(false);
});

test('isGenerator', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isGenerator(values[index])).toBe(false);
	}

	const generator = function* () {};

	expect(isGeneratorFunction(generator)).toBe(true);
	expect(isAsyncGeneratorFunction(generator)).toBe(false);

	const generated = generator();

	expect(isGenerator(generated)).toBe(true);
	expect(isAsyncGenerator(generated)).toBe(false);
});

test('isPlan', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isPlan(values[index])).toBe(false);
	}

	const planned = plan(function* () {});

	expect(isPlan(planned)).toBe(true);
	expect(isAsyncPlan(planned)).toBe(false);
});

test('isStep', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isStep(values[index])).toBe(false);
	}

	const step = use('step');

	expect(isStep(step)).toBe(true);
	expect(isAsyncStep(step)).toBe(false);
});

test('isSuccess', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isSuccess(values[index])).toBe(false);
	}

	const success = succeed('step');

	expect(isSuccess(success)).toBe(true);
	expect(isAsyncSuccess(success)).toBe(false);
});
