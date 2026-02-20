export type TestArrayItem = {
	age: number;
	id: number;
	name: string;
};

const complex: TestArrayItem[] = [
	{id: 1, age: 25, name: 'Alice'},
	{id: 2, age: 30, name: 'Bob'},
	{id: 3, age: 25, name: 'Charlie'},
	{id: 4, age: 30, name: 'Alice'},
	{id: 5, age: 35, name: 'David'},
];

const simple = [1, 2, 3, 4];

export const arrayFixture = {
	complex,
	simple,
};
