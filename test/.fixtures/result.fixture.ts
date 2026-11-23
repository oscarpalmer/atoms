import {error, ok} from '../../src/internal/result/value';

const nope = error('nope');
const yay = ok('yay');

const isResults = [
	[
		nope,
		{
			isError: true,
			isErrorLike: true,
			isOk: false,
			isOkLike: false,
			isResult: true,
			isResultLike: true,
		},
	],
	[
		yay,
		{
			isError: false,
			isErrorLike: false,
			isOk: true,
			isOkLike: true,
			isResult: true,
			isResultLike: true,
		},
	],
	[
		{error: 'nope', ok: false},
		{
			isError: false,
			isErrorLike: true,
			isOk: false,
			isOkLike: false,
			isResult: false,
			isResultLike: true,
		},
	],
	[
		{ok: true, value: 'yay'},
		{
			isError: false,
			isErrorLike: false,
			isOk: false,
			isOkLike: true,
			isResult: false,
			isResultLike: true,
		},
	],
	[
		{error: undefined, ok: false},
		{
			isError: false,
			isErrorLike: true,
			isOk: false,
			isOkLike: false,
			isResult: false,
			isResultLike: true,
		},
	],
	[
		{ok: true, value: undefined},
		{
			isError: false,
			isErrorLike: false,
			isOk: false,
			isOkLike: true,
			isResult: false,
			isResultLike: true,
		},
	],
	[
		{error: '', ok: false, value: ''},
		{
			isError: false,
			isErrorLike: false,
			isOk: false,
			isOkLike: false,
			isResult: false,
			isResultLike: false,
		},
	],
	[
		{error: '', ok: true, value: ''},
		{
			isError: false,
			isErrorLike: false,
			isOk: false,
			isOkLike: false,
			isResult: false,
			isResultLike: false,
		},
	],
	[
		{ok: false},
		{
			isError: false,
			isErrorLike: false,
			isOk: false,
			isOkLike: false,
			isResult: false,
			isResultLike: false,
		},
	],
	[
		{ok: true},
		{
			isError: false,
			isErrorLike: false,
			isOk: false,
			isOkLike: false,
			isResult: false,
			isResultLike: false,
		},
	],
] as const;

/**
 * Expected outcomes are the parsed results (compared with `toEqual`), or `undefined` if not parseable.
 * Real results are expected to be returned as-is; like-values as new instances.
 */
const parseResults = [
	[
		nope,
		{
			parseError: nope,
			parseOk: undefined,
			parseResult: nope,
		},
	],
	[
		yay,
		{
			parseError: undefined,
			parseOk: yay,
			parseResult: yay,
		},
	],
	[
		{error: 'nope', ok: false},
		{
			parseError: error('nope'),
			parseOk: undefined,
			parseResult: error('nope'),
		},
	],
	[
		{ok: true, value: 'yay'},
		{
			parseError: undefined,
			parseOk: ok('yay'),
			parseResult: ok('yay'),
		},
	],
	[
		{error: undefined, ok: false},
		{
			parseError: error(undefined),
			parseOk: undefined,
			parseResult: error(undefined),
		},
	],
	[
		{ok: true, value: undefined},
		{
			parseError: undefined,
			parseOk: ok(undefined),
			parseResult: ok(undefined),
		},
	],
	[
		{error: '', ok: false, value: ''},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{error: '', ok: true, value: ''},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{ok: false},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{ok: true},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{ok: false, value: 'yay'},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{error: 'nope', ok: true},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{ok: 1, value: 'yay'},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
	[
		{error: 'nope', ok: 'false'},
		{
			parseError: undefined,
			parseOk: undefined,
			parseResult: undefined,
		},
	],
] as const;

const resultFixture = {
	is: {
		length: isResults.length,
		values: isResults,
	},
	parse: {
		length: parseResults.length,
		values: parseResults,
	},
};

export {resultFixture};
