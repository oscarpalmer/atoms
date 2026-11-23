import {expect, test} from 'vite-plus/test';
import {
	attempt,
	error,
	isError,
	isErrorLike,
	isOk,
	isOkLike,
	isResult,
	isResultLike,
	ok,
	parseError,
	parseOk,
	parseResult,
	RESULT_MESSAGE_PROMISE,
	toPromise,
	unwrap,
} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';
import {resultFixture} from '../.fixtures/result.fixture';

const {values, length} = isFixture;
const {is, parse} = resultFixture;

test('is', () => {
	expect(error.is).toBe(isError);
	expect(error.like).toBe(isErrorLike);
	expect(ok.is).toBe(isOk);
	expect(ok.like).toBe(isOkLike);

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		expect(isError(value)).toBe(false);
		expect(isErrorLike(value)).toBe(false);
		expect(isOk(value)).toBe(false);
		expect(isOkLike(value)).toBe(false);
		expect(isResult(value)).toBe(false);
		expect(isResultLike(value)).toBe(false);
	}

	for (let index = 0; index < is.length; index += 1) {
		const [value, expected] = is.values[index];

		expect(isError(value)).toBe(expected.isError);
		expect(isErrorLike(value)).toBe(expected.isErrorLike);
		expect(isOk(value)).toBe(expected.isOk);
		expect(isOkLike(value)).toBe(expected.isOkLike);
		expect(isResult(value)).toBe(expected.isResult);
		expect(isResultLike(value)).toBe(expected.isResultLike);
	}
});

test('parse', () => {
	expect(error.parse).toBe(parseError);
	expect(ok.parse).toBe(parseOk);

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		expect(parseError(value)).toBeUndefined();
		expect(parseOk(value)).toBeUndefined();
		expect(parseResult(value)).toBeUndefined();
	}

	for (let index = 0; index < parse.length; index += 1) {
		const [value, expected] = parse.values[index];

		const parsedError = parseError(value);
		const parsedOk = parseOk(value);
		const parsedResult = parseResult(value);

		expect(parsedError).toEqual(expected.parseError);
		expect(parsedOk).toEqual(expected.parseOk);
		expect(parsedResult).toEqual(expected.parseResult);

		// Real results are returned as-is; like-values are turned into new instances
		const isSame = isResult(value);

		expect(parsedError === value).toBe(isSame && parsedError != null);
		expect(parsedOk === value).toBe(isSame && parsedOk != null);
		expect(parsedResult === value).toBe(isSame && parsedResult != null);

		expect(isError(parsedError)).toBe(parsedError != null);
		expect(isError(parsedOk)).toBe(false);

		expect(isOk(parsedError)).toBe(false);
		expect(isOk(parsedOk)).toBe(parsedOk != null);

		expect(isResult(parsedError)).toBe(parsedError != null);
		expect(isResult(parsedOk)).toBe(parsedOk != null);
		expect(isResult(parsedResult)).toBe(parsedResult != null);
	}
});

test('toPromise', async () => {
	const success = ok('Hello, world!');
	const failure = error('Something went wrong!');

	await expect(toPromise(success)).resolves.toBe('Hello, world!');
	await expect(toPromise(failure)).rejects.toBe('Something went wrong!');

	await expect(toPromise(() => success)).resolves.toBe('Hello, world!');
	await expect(toPromise(() => failure)).rejects.toBe('Something went wrong!');

	await expect(toPromise('blah' as never)).rejects.toThrow(RESULT_MESSAGE_PROMISE);

	await expect(toPromise(() => 'blah' as never)).rejects.toThrow(RESULT_MESSAGE_PROMISE);
});

test('unwrap', () => {
	const failure = attempt(() => {
		throw new Error('Failure');
	});

	const success = attempt(() => 'Hello, world!');

	expect(unwrap(success, () => 'Oh no…')).toBe('Hello, world!');
	expect(unwrap(failure, error => `${error.message}!`)).toBe('Failure!');

	expect(
		unwrap(123 as never, error => {
			expect(error).toBeUndefined();

			return 'Oh no…';
		}),
	).toBe('Oh no…');

	expect(unwrap(success, 'Oh no…')).toBe('Hello, world!');
	expect(unwrap(failure, 'Oh no…')).toBe('Oh no…');
	expect(unwrap(123 as never, 'Oh no…')).toBe('Oh no…');

	expect(unwrap(success)).toBe('Hello, world!');
	expect(() => unwrap(failure)).toThrow();
	expect(() => unwrap(123 as never)).toThrow();
});
