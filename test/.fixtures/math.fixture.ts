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
				age: 25,
				name: 'Alice',
			},
			{
				age: 35,
				name: 'Bob',
			},
			{
				age: 'blah',
				name: 'Charlie',
			},
		] as TestMathPerson[],
		items: [new TestMathItem(123), new TestMathItem('blah' as never), new TestMathItem(456)],
	},
};

const rounded = {
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
