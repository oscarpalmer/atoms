// #region Types

export type StringCase =
	| 'camel'
	| 'capitalize'
	| 'kebab'
	| 'lower'
	| 'pascal'
	| 'snake'
	| 'title'
	| 'upper';

export type StringCaseOptions = {
	capitalizeAny: boolean;
	capitalizeFirst: boolean;
	type: StringCase;
};

// #endregion

// #region Variables

export const STRING_CASE_CAMEL: StringCase = 'camel';

export const STRING_CASE_CAPITALIZE: StringCase = 'capitalize';

export const STRING_CASE_KEBAB: StringCase = 'kebab';

export const STRING_CASE_LOWER: StringCase = 'lower';

export const STRING_CASE_PASCAL: StringCase = 'pascal';

export const STRING_CASE_SNAKE: StringCase = 'snake';

export const STRING_CASE_TITLE: StringCase = 'title';

export const STRING_CASE_UPPER: StringCase = 'upper';

export const STRING_DELIMITER_EMPTY = '';

export const STRING_DELIMITER_HYPHEN = '-';

export const STRING_DELIMITER_SPACE = ' ';

export const STRING_DELIMITER_UNDERSCORE = '_';

export const STRING_EXPRESSION_CAMEL_CASE: RegExp = /(\p{Ll})(\p{Lu})/gu;

export const STRING_EXPRESSION_ACRONYM: RegExp =
	/(?<=\p{Lu})(?=\p{Lu}\p{Ll})(?!\p{Lu}s(?!\p{Ll}))/gu;

export const STRING_REPLACEMENT_CAMEL_CASE = '$1-$2';

export const ignoreCachingCases: Set<StringCase> = new Set(['lower', 'upper']);

// #endregion
