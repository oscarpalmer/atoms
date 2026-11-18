export class TestMathItem {
	constructor(readonly value: number) {}
}

export type TestMathPerson = {
	age: number;
	name: string;
};

const array = {
	invalid: {
		empty: [],
		values: {
			items: [null, undefined, true, false, 'abc', {}, () => {}, new Map(), new Set()],
			length: 9,
		},
	},
	valid: {
		one: [123],
		two: [123, 456],
		three: [789, 123, 456],
		four: [123, 1011, 789, 456],
		five: [1011, 789, 456, 123, 1213],
		people: [
			{
				age: 26,
				name: 'Alice',
			},
			{
				age: 32,
				name: 'Bob',
			},
			{
				age: 'blah',
				name: 'Charlie',
			},
			{
				age: 32,
				name: 'Dahlia',
			},
		] as TestMathPerson[],
		items: [new TestMathItem(123), new TestMathItem('blah' as never), new TestMathItem(456)],
	},
};

const rounded = {
	// [value, decimals, ceil, floor, round]
	cases: [
		// Exact values (issue #1)
		[0, 2, 0, 0, 0],
		[1, 2, 1, 1, 1],
		[0.07, 2, 0.07, 0.07, 0.07],
		[1.1, 2, 1.1, 1.1, 1.1],
		[-1, 2, -1, -1, -1],
		[4.35, 2, 4.35, 4.35, 4.35],
		[-4.35, 2, -4.35, -4.35, -4.35],

		// Values that need rounding
		[1.234, 2, 1.24, 1.23, 1.23],
		[10.567, 2, 10.57, 10.56, 10.57],
		[-1.234, 2, -1.23, -1.24, -1.23],

		// Halfway values (`Math.round` rounds halves towards positive infinity)
		[1.005, 2, 1.01, 1, 1.01],
		[-1.005, 2, -1, -1.01, -1],

		// Exponent notation when stringified
		[1e-7, 2, 0.01, 0, 0],
		[1.5e-7, 7, 2e-7, 1e-7, 2e-7],
		[1.5e-30, 30, 2e-30, 1e-30, 2e-30],
		[1.5e21, 2, 1.5e21, 1.5e21, 1.5e21],

		// Negative zero
		[-0.001, 2, -0, -0.01, -0],

		// Different numbers of decimals
		[4.35, 0, 5, 4, 4],
		[4.35, -1, 5, 4, 4],
		[4.35, 1, 4.4, 4.3, 4.4],
		[4.35, 3, 4.35, 4.35, 4.35],
		[1.234, 2.5, 1.24, 1.23, 1.23],
		[1.234, 25, 1.234, 1.234, 1.234],

		// Non-finite values
		[Number.NaN, 2, Number.NaN, Number.NaN, Number.NaN],
		[
			Number.POSITIVE_INFINITY,
			2,
			Number.POSITIVE_INFINITY,
			Number.POSITIVE_INFINITY,
			Number.POSITIVE_INFINITY,
		],
		[
			Number.NEGATIVE_INFINITY,
			2,
			Number.NEGATIVE_INFINITY,
			Number.NEGATIVE_INFINITY,
			Number.NEGATIVE_INFINITY,
		],
	] as [number, number, number, number, number][],
	value: 123.456789,
	decimals: [null, -1, 0, 1, 2, 3, 4, 5],
	length: 8,
	result: {
		ceil: [124, 124, 124, 123.5, 123.46, 123.457, 123.4568, 123.45679],
		floor: [123, 123, 123, 123.4, 123.45, 123.456, 123.4567, 123.45678],
		round: [123, 123, 123, 123.5, 123.46, 123.457, 123.4568, 123.45679],
	},
};

export const mathFixture = {
	array,
	rounded,
};
