/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Use this function when inserting user-controlled data into HTML contexts.
 */
export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Escapes HTML and converts newlines to <br/> tags.
 * Use for multi-line text that should preserve line breaks.
 */
export const escapeHtmlWithBreaks = (unsafe: string): string => {
  if (!unsafe) return '';
  return escapeHtml(unsafe).replace(/\n/g, "<br/>");
};
