// Allowed characters for public form input. Letters include accents/ñ via \p{L}.

/** Person names: letters, spaces, apostrophe, dot, hyphen */
export const NAME_PATTERN = /^[\p{L}\p{M}' .-]+$/u;

/** Phone numbers: digits, spaces, parentheses, hyphen, optional leading + */
export const PHONE_PATTERN = /^\+?[0-9 ()-]+$/;

/** Place and city names: letters, digits, spaces and . , ' - ( ) */
export const PLACE_PATTERN = /^[\p{L}\p{M}0-9 .,'()-]+$/u;

/**
 * Free text (messages): letters, digits, whitespace and common punctuation.
 * Rejects markup and symbols such as < > { } [ ] \ | ^ ~ ` * = # & @ and emoji.
 */
export const TEXT_PATTERN = /^[\p{L}\p{M}0-9\s.,;:¿?¡!()'"%$/+-]+$/u;

/**
 * Links rendered on the site: absolute http(s) URLs or internal paths ("/contact").
 * Rejects javascript:, data: and protocol-relative ("//evil.com") links.
 */
export const SAFE_HREF_PATTERN = /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i;
