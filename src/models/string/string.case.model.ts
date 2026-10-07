// #region Types

export type StringCase = 'camel' | 'kebab' | 'pascal' | 'snake';

export type StringCaseOptions = {
	capitalizeAny: boolean;
	capitalizeFirst: boolean;
	type: StringCase;
};

// #endregion

// #region Variables

export const STRING_CASE_CAMEL: StringCase = 'camel';

export const STRING_CASE_KEBAB: StringCase = 'kebab';

export const STRING_CASE_PASCAL: StringCase = 'pascal';

export const STRING_CASE_SNAKE: StringCase = 'snake';

export const STRING_DELIMTER_EMPTY = '';

export const STRING_DELIMITER_HYPHEN = '-';

export const STRING_DELIMITER_UNDERSCORE = '_';

export const STRING_EXPRESSION_CAMEL_CASE: RegExp = /(\p{Ll})(\p{Lu})/gu;

export const STRING_EXPRESSION_ACRONYM: RegExp = /(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu;

export const STRING_REPLACEMENT_CAMEL_CASE = '$1-$2';

export const STRING_S = 's';

// #endregion
