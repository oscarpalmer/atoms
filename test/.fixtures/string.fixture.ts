export class TestStringItemWithoutToString {
	value: string;

	constructor(value: string) {
		this.value = value;
	}
}

export class TestStringItemWithToString {
	value: string;

	constructor(value: string) {
		this.value = value;
	}

	toString() {
		return this.value;
	}
}

const strings = [
	'Hello, world!',
	'The quick brown fox jumps over the lazy dog',
	'Η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί',
	'Быстрая коричневая лиса прыгает через ленивую собаку',
];

export const stringFixture = {
	strings,
};
