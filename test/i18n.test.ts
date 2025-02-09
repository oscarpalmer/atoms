import {expect, test} from 'vitest';
import {type Translatable, translate} from '../src/i18n';

const primitives = [
	null,
	undefined,
	99n,
	true,
	123,
	'Hello, world!',
	[],
	{},
	() => '!?',
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

	expect(translate(primitives)).toBe('99true123Hello, world!!?');

	expect(translate(primitives, {delimiter: ', '})).toBe(
		'99, true, 123, Hello, world!, !?',
	);

	expect(translate({})).toBe('');
	expect(translate({foo: 'bar'})).toBe('');
	expect(translate([])).toBe('');
	expect(translate([{}])).toBe('');
	expect(translate([{foo: 'bar'}])).toBe('');
	expect(translate({en: 123})).toBe('123');

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
