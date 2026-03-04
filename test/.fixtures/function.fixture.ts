export class TestFunctionItem {}

export function testIsString(value: unknown): value is string {
	return typeof value === 'string';
}
