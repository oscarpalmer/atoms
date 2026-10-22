// #region Types

export type StringMatch = 'endsWith' | 'includes' | 'startsWith';

// #endregion

// #region Variables

export const STRING_DELIMITER_UUID_DEFAULT = '-';

export const STRING_DELIMITER_UUID_HTML = '_';

export const STRING_EXPRESSION_IGNORED: RegExp = /(^|\.)(__proto__|constructor|prototype)(\.|$)/i;

export const STRING_EXPRESSION_WORDS: RegExp = /[\dA-Za-z\P{ASCII}]+/gu;

export const STRING_EXPRESSION_WHITESPACE_PREFIX: RegExp = /^(\s+)/;

export const STRING_MATCH_ENDS_WITH: StringMatch = 'endsWith';

export const STRING_MATCH_INCLUDES: StringMatch = 'includes';

export const STRING_MATCH_STARTS_WITH: StringMatch = 'startsWith';

export const STRING_NEWLINE = '\n';

export const STRING_ZERO = '0';

// #endregion
