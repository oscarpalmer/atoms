export class TestMathItem {
	constructor(readonly value: number) {}
}

export type TestMathPerson = {
	age: number;
	name: string;
};

const invalid = {
	empty: [],
	values: {
		items: [null, undefined, true, false, 'abc', {}, () => {}, new Map(), new Set()],
		length: 9,
	},
};

const valid = {
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
};

export const mathFixture = {
	invalid,
	valid,
};
