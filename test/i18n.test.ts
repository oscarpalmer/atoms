import {expect, test} from 'vitest';
import {type Translatable, translate} from '../src/i18n';

class Test {
	toString() {
		return 'I am a test instance!';
	}
}

function obj() {
	return Object.create({
		toString() {
			return 'I am an object!';
		},
	});
}

const values = [
	null,
	undefined,
	99n,
	true,
	123,
	'Hello, world!',
	[],
	{},
	() => '!?',
	() => () => '???',
	obj(),
	new Test(),
];

const translation: Translatable = {
	en: 'Hello',
	'en-US': 'Hey',
	es: 'Hola',
	'es-ES': '¡Hola!',
	fr: 'Bonjour',
	'fr-CA': 'Salut',
	fil: 'Kumusta',
};

const translations = [translation, translation];

test('translate', () => {
	expect(translate(translation)).toBe('Hey');
	expect(translate(translation, {language: 'en'})).toBe('Hello');
	expect(translate(translation, {language: 'english'})).toBe('Hey');
	expect(translate(translation, {language: 'en-GB'})).toBe('Hello');
	expect(translate(translation, {language: 'en-US'})).toBe('Hey');
	expect(translate(translation, {language: 'es'})).toBe('Hola');
	expect(translate(translation, {language: 'es-ES'})).toBe('¡Hola!');
	expect(translate(translation, {language: 'ES-ES'})).toBe('Hey');
	expect(translate(translation, {language: 'fr'})).toBe('Bonjour');
	expect(translate(translation, {language: 'fr-CA'})).toBe('Salut');
	expect(translate(translation, {language: 'fil'})).toBe('Kumusta');
	expect(translate(translation, {language: 'ja'})).toBe('Hey');
	expect(translate(translation, {fallback: 'es', language: 'zh'})).toBe('Hola');

	expect(translate(translations)).toBe('HeyHey');
	expect(translate(translations, {delimiter: ', '})).toBe('Hey, Hey');
	expect(translate(translations, {language: 'en'})).toBe('HelloHello');
	expect(translate(translations, {language: 'en-GB'})).toBe('HelloHello');
	expect(translate(translations, {language: 'en-US'})).toBe('HeyHey');
	expect(translate(translations, {language: 'es'})).toBe('HolaHola');
	expect(translate(translations, {language: 'es-ES'})).toBe('¡Hola!¡Hola!');
	expect(translate(translations, {language: 'fr'})).toBe('BonjourBonjour');
	expect(translate(translations, {language: 'fr-CA'})).toBe('SalutSalut');
	expect(translate(translations, {language: 'fil'})).toBe('KumustaKumusta');
	expect(translate(translations, {language: 'ja'})).toBe('HeyHey');
	expect(translate(translations, {fallback: 'fr-BE', language: 'zh'})).toBe(
		'BonjourBonjour',
	);

	expect(translate(values)).toBe(
		'99true123Hello, world!!?I am an object!I am a test instance!',
	);

	expect(translate(values, {delimiter: ', '})).toBe(
		'99, true, 123, Hello, world!, !?, I am an object!, I am a test instance!',
	);

	expect(translate({})).toBe('');
	expect(translate({foo: 'bar'})).toBe('');
	expect(translate([])).toBe('');
	expect(translate([{}])).toBe('');
	expect(translate([{foo: 'bar'}])).toBe('');

	expect(translate({en: null})).toBe('');
	expect(translate({en: undefined})).toBe('');
	expect(translate({en: 99n})).toBe('99');
	expect(translate({en: true})).toBe('true');
	expect(translate({en: 123})).toBe('123');
	expect(translate({en: 'xyz'})).toBe('xyz');
	expect(translate({en: [1, 2, 3]})).toBe('123');
	expect(translate({en: {foo: 'bar'}})).toBe('');
	expect(translate({en: () => 'xyz'})).toBe('xyz');
	expect(translate({en: () => () => 'xyz'})).toBe('');
	expect(translate({en: obj()})).toBe('I am an object!');
	expect(translate({en: new Test()})).toBe('I am a test instance!');

	expect(translate(null)).toBe('');
	expect(translate(undefined)).toBe('');
	expect(translate(99n)).toBe('99');
	expect(translate(true)).toBe('true');
	expect(translate(123)).toBe('123');
	expect(translate('xyz')).toBe('xyz');
	expect(translate([1, 2, 3])).toBe('123');
	expect(translate({foo: 'bar'})).toBe('');
	expect(translate(() => 'xyz')).toBe('xyz');
	expect(translate(() => () => 'xyz')).toBe('');
	expect(translate(obj())).toBe('I am an object!');
	expect(translate(new Test())).toBe('I am a test instance!');

	translate.configure({
		fallback: 'sv',
		language: 'sv',
	});

	expect(translate(translation)).toBe('');

	translate.configure({
		delimiter: ', ',
		fallback: 'en',
		language: 'en',
	});

	expect(translate(translations)).toBe('Hello, Hello');

	translate.configure({
		fallback: 'x',
		language: 'y',
	});

	let configuration = translate.configuration();

	expect(configuration.fallback).toBe('en');
	expect(configuration.language).toBe('en');

	translate.configure({
		delimiter: 123 as never,
		fallback: 123 as never,
		language: 123 as never,
	});

	configuration = translate.configuration();

	expect(configuration.delimiter).toBe(', ');
	expect(configuration.fallback).toBe('en');
	expect(configuration.language).toBe('en');

	translate.configure({});

	configuration = translate.configuration();

	expect(configuration.delimiter).toBe(', ');
	expect(configuration.fallback).toBe('en');
	expect(configuration.language).toBe('en');
});
