export type TestValueDiffable = {
	numbers: number[];
	object: {
		nested: {
			[key: string]: unknown;
		};
	};
	strings: string[];
	value: unknown;
};

export type TestValueDiffableExtended = {
	additional: unknown;
} & TestValueDiffable;

export type TestValueMergeable = {
	age: number;
	cars: string[];
	hobbies: string[];
	name: {first: string; last: string};
	profession: string;
};
