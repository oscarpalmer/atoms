const values = [
	undefined,
	null,
	[],
	() => {},
	'',
	' ',
	'123',
	'123.456',
	'test',
	0,
	123,
	123.456,
	true,
	false,
	Symbol('test'),
	{},
	[1, 2, 3],
	() => 'hello, world',
	new Map(),
	new Set(),
];

export const isFixture = {
	values,
	length: values.length,
};
