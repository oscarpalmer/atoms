export class TestMathItem {
	constructor(readonly value: number) {}
}

export type TestMathPerson = {
	age?: number;
	name?: string;
};

const one = [123, 'abc'];
const two = [123, 'abc', 456];
const three = [123, 'abc', 456, 'def', 789];

const four: TestMathPerson[] = [
	{age: 25, name: 'John'},
	{age: 30, name: 'Jane'},
	{age: 35, name: 'Joe'},
	{name: 'invalid'},
];

const five = [new TestMathItem(123), new TestMathItem(456), new TestMathItem(789)];

const six = ['abc', 'defg', 'hi'];

export const mathFixture = {
	one,
	two,
	three,
	four,
	five,
	six,
};
