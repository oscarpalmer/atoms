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

const indentations = {
	cases: [
		'',
		'    ',
		`  Hello,\n		World!\n  `,
		`	<div>
		<p>Hello, world!</p>
<p>Not indented</p>
	</div>				`,
		`Nothing\nis\nindented`,
	],
	results: [
		'',
		'',
		'Hello,\nWorld!',
		`<div>
	<p>Hello, world!</p>
<p>Not indented</p>
</div>`,
		`Nothing\nis\nindented`,
	],
};

const strings = [
	'a',
	'A',
	'Hello, world!',
	'The quick brown fox jumps over the lazy dog',
	'Η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί',
	'Быстрая коричневая лиса прыгает через ленивую собаку',
];

export const stringFixture = {
	indentations,
	strings,
};
