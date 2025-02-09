import type {PlainObject} from './models';

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

const defaults: Defaults = {
	delimiter: '',
	languages: {
		fallback: null as never,
		preferred: null as never,
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
function getTranslation(value: unknown, key?: string): string {
	if (typeof value !== 'object' || value == null || key == null) {
		return '';
	}

	const translation = (value as PlainObject)[key];

	return typeof translation === 'string' ? translation : String(translation);
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
	return translateValue(value, null as never, null as never, options);
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
 * Translates a primitive value _(into a string)_
 */
function translatePrimitive(value: unknown): string {
	let actual = value;

	if (typeof value === 'function') {
		actual = value();
	}

	return actual == null
		? ''
		: typeof actual === 'string'
			? actual
			: String(actual);
}

/**
 * Translates a translatable object _(or array of translatable objects)_ into a string
 */
function translateTranslatable(
	value: PlainObject | PlainObject[],
	delimiter: string,
	languages: Partial<Languages>,
	options?: Partial<TranslateOptions>,
): string {
	let actualDelimiter = delimiter ?? defaults.delimiter;
	let actualLanguages = languages;

	if (options != null) {
		actualDelimiter =
			typeof options.delimiter === 'string'
				? options.delimiter
				: defaults.delimiter;

		actualLanguages = {
			fallback: getLanguage(options.fallback),
			preferred: getLanguage(options.language),
		};
	}

	if (Array.isArray(value)) {
		return value
			.map(item => translateValue(item, actualDelimiter, actualLanguages))
			.filter(translated => translated.trim().length > 0)
			.join(actualDelimiter);
	}

	return getTranslation(
		value,
		getKey(value, actualLanguages) ?? getKey(value, defaults.languages),
	);
}

/**
 * Translates a value _(into a string)_
 */
function translateValue(
	value: unknown,
	delimiter: string,
	language: Partial<Languages>,
	options?: Partial<TranslateOptions>,
): string {
	return typeof value !== 'object' || value == null
		? translatePrimitive(value)
		: translateTranslatable(
				value as PlainObject | PlainObject[],
				delimiter,
				language,
				options,
			);
}

const defaultLanguage =
	(document?.documentElement?.lang?.trim()?.length ?? 0) > 0
		? document.documentElement.lang
		: (navigator?.language ?? 'en');

setLanguage('fallback', defaultLanguage);
setLanguage('preferred', defaultLanguage);
