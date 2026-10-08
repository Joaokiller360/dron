/**
 * Request URL safe for logs: the token of a public proforma link works like a
 * password (anyone holding it reads the quote), so it is masked.
 */
export const redactUrl = (url: string) => url.replace(/(\/quotes\/public\/)[^/?#]+/, '$1***');
