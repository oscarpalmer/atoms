function* getA() {
	yield 'a';

	return 'a';
}

export function* getABC() {
	const a = yield* getA();
	const b = yield* getB();
	const c = yield* getC();

	return `${a}${b}${c}`;
}

function* getB() {
	yield 'b';

	return 'b';
}

function* getC() {
	yield 'c';

	return 'c';
}

async function* getPrefix() {
	yield 'prefix';
	yield new Promise(resolve => setTimeout(resolve, 1000));

	return 'hello';
}

export async function* getMessage() {
	const prefix = yield* getPrefix();
	const suffix = getSuffix();

	const message = `${prefix}${suffix}`;

	yield message;

	return message;
}

function getSuffix() {
	return ', world!';
}
