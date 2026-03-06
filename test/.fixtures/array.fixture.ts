export type TestArrayItem = {
	age: number;
	id: number;
	name: string;
};

const complex: TestArrayItem[] = [
	{id: 1, age: 25, name: 'Alice'},
	{id: 2, age: 30, name: 'Bob'},
	{id: 3, age: 35, name: 'Charlie'},
	{id: 4, age: 30, name: 'Alice'},
	{id: 5, age: 35, name: 'David'},
];

const sets = {
	complex: complex.filter((_, index) => index % 2 === 0),
	simple: [1, 3, 5],
};

const simple = [1, 2, 3, 4, 5];

export const arrayFixture = {
	complex,
	sets,
	simple,
};
