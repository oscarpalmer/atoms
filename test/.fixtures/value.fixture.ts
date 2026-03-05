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

export type TestValueNestedData = {
	a: {
		b: unknown[];
		c: {
			d: number;
		};
	};
	change: object;
	in: {
		a: {
			nested: {
				array: unknown[];
				map: Map<unknown, unknown>;
				object: object;
				set: Set<unknown>;
			};
		};
	};
	update: number;
};

const nested: TestValueNestedData = {
	a: {
		b: [{}, new Map([['c', new Set([null, 123])]]), {}],
		c: {
			d: 123,
		},
	},
	change: {},
	in: {
		a: {
			nested: {
				array: [],
				map: new Map(),
				object: {},
				set: new Set(),
			},
		},
	},
	update: 0,
};

export const valueFixture = {
	nested,
};
