import type {PlainObject, Primitive} from './models';

type Defaults = {
	/**
	 * Delimiter to use when translating an array of translatable values
	 */
	delimiter: string;
	/**
	 * Languages to use when translating
	 */
	languages: Languages;
};

type Language = {
	/**
	 * Language code _(e.g. `en`, `es`, `fr`, `ja`, `zh`)_
	 */
	readonly base: string;
	/**
	 * Language code with region _(e.g. `en-US`, `es-ES`, `fr-FR`, `ja-JP`, `zh-CN`)_
	 */
	readonly full: string;
	/**
	 * Region code _(e.g. `US`, `ES`, `FR`, `JP`, `CN`)_
	 */
	readonly region?: string;
};

type Languages = {
	/**
	 * Language to use when no translation is found
	 */
	fallback: Language;
	/**
	 * Language to use when translating
	 */
	preferred: Language;
};

type TranslateConfiguration = TranslateOptions;

export type TranslateOptions = {
	/**
	 * Delimiter to use when translating an array of translatable values
	 */
	delimiter: string;
	/**
	 * Language to use when no translation is found
	 */
	fallback: string;
	/**
	 * Language to use when translating
	 */
	language: string;
};

/**
 * A translatable object
 */
export type Translatable = Record<string, unknown>;

const english: Language = {
	base: 'en',
	full: 'en',
};

const defaults: Defaults = {
	delimiter: '',
	languages: {
		fallback: english,
		preferred: english,
	},
};

/**
 * Get translation key for a translatable object
 */
function getKey(
	value: PlainObject,
	languages: Partial<Languages>,
): string | undefined {
	if (languages?.fallback == null && languages?.preferred == null) {
		return;
	}

	const {fallback, preferred} = languages;

	switch (true) {
		case preferred != null && preferred.full in value:
			return preferred.full;

		case preferred != null &&
			preferred.region != null &&
			preferred.base in value:
			return preferred.base;

		case fallback != null && fallback.full in value:
			return fallback.full;

		case fallback != null && fallback.region != null && fallback.base in value:
			return fallback.base;
	}
}

/**
 * Get a _Language_ from a value
 */
function getLanguage(value: unknown): Language | undefined {
	if (typeof value !== 'string') {
		return;
	}

	const [full, base, region] =
		/^([a-z]{2,3})(?:-([A-Z]{2}))?$/.exec(value) ?? [];

	if (full != null) {
		return {base, full, region};
	}
}

/**
 * Get translation for a key from a translatable object
 */
function getTranslation(
	value: PlainObject,
	key: string | undefined,
	delimiter: string,
	languages: Partial<Languages>,
): string {
	if (key != null) {
		return translateValue((value as PlainObject)[key], delimiter, languages);
	}

	const asString = value.toString();

	return asString === '[object Object]' ? '' : asString;
}

function initialize(): void {
	let defaultLanguage: string | undefined;

	try {
		if (
			typeof window !== 'undefined' &&
			typeof document !== 'undefined' &&
			typeof navigator !== 'undefined'
		) {
			if (document.documentElement) {
				const documentLanguage = document.documentElement.lang?.trim() ?? '';

				if (documentLanguage.length > 0) {
					defaultLanguage = documentLanguage;
				}
			}

			if (navigator.language && !defaultLanguage) {
				defaultLanguage = navigator.language;
			}
		}
	} catch {}

	defaultLanguage ??= 'en';

	setLanguage('fallback', defaultLanguage);
	setLanguage('preferred', defaultLanguage);
}

/**
 * Set a _Language_ for a key
 */
function setLanguage(key: keyof Languages, value: string): void {
	const language = getLanguage(value);

	if (language != null) {
		defaults.languages[key] = language;
	}
}

/**
 * Translates a value _(with optional options, but defaulting to configuration)_
 */
export function translate(
	value: unknown,
	options?: Partial<TranslateOptions>,
): string;

/**
 * Translates an array of values _(with optional options, but defaulting to configuration)_
 */
export function translate(
	value: unknown[],
	options?: Partial<TranslateOptions>,
): string;

export function translate(
	value: unknown | unknown[],
	options?: Partial<TranslateOptions>,
): string {
	let delimiter = defaults.delimiter;
	let languages: Partial<Languages> = defaults.languages;

	if (options != null) {
		delimiter =
			typeof options.delimiter === 'string'
				? options.delimiter
				: defaults.delimiter;

		languages = {
			fallback: getLanguage(options.fallback),
			preferred: getLanguage(options.language),
		};
	}

	return translateUnknown(value, delimiter, languages);
}

/**
 * Configures the translation options _(used as defaults when translating)_
 */
translate.configure = (
	configuration: Partial<TranslateConfiguration>,
): void => {
	if (typeof configuration.delimiter === 'string') {
		defaults.delimiter = configuration.delimiter;
	}

	if (typeof configuration.fallback === 'string') {
		setLanguage('fallback', configuration.fallback);
	}

	if (typeof configuration.language === 'string') {
		setLanguage('preferred', configuration.language);
	}
};

/**
 * Gets the current translation configuration
 */
translate.configuration = (): TranslateConfiguration => {
	return {
		delimiter: String(defaults.delimiter),
		fallback: String(defaults.languages.fallback.full),
		language: String(defaults.languages.preferred.full),
	};
};

/**
 * Translates a primitive value into a string
 */
function translatePrimitive(value: Primitive): string {
	return value == null ? '' : typeof value === 'string' ? value : String(value);
}

/**
 * Translates a translatable object _(or array of translatable objects)_ into a string
 */
function translateTranslatable(
	value: PlainObject | PlainObject[],
	delimiter: string,
	languages: Partial<Languages>,
): string {
	if (Array.isArray(value)) {
		return value
			.map(item => translateValue(item, delimiter, languages))
			.filter(translated => translated.trim().length > 0)
			.join(delimiter);
	}

	return getTranslation(
		value,
		getKey(value, languages) ?? getKey(value, defaults.languages),
		delimiter,
		languages,
	);
}

/**
 * Translates a value _(into a string)_
 */
function translateUnknown(
	value: unknown,
	delimiter: string,
	languages: Partial<Languages>,
): string {
	return typeof value !== 'object' || value == null
		? translateValue(value, delimiter, languages)
		: translateTranslatable(
				value as PlainObject | PlainObject[],
				delimiter,
				languages,
			);
}

/**
 * Translates a value _(into a string)_
 */
function translateValue(
	value: unknown,
	delimiter: string,
	languages: Partial<Languages>,
): string {
	let actual = value;

	if (typeof value === 'function') {
		actual = value();

		if (typeof actual === 'function') {
			return '';
		}
	}

	if (Array.isArray(actual)) {
		return translateTranslatable(actual, delimiter, languages);
	}

	if (typeof actual === 'object' && actual != null) {
		const asString = actual.toString();

		return asString === '[object Object]'
			? translateTranslatable(actual as PlainObject, delimiter, languages)
			: asString;
	}

	return translatePrimitive(actual as Primitive);
}

initialize();
