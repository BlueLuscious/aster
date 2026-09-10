/**
 * @description Escapes untrusted authored values for explicit HTML content contexts.
 */
export class HtmlContentEscaper {
  /**
   * @description Escapes one value for an HTML text node.
   * @param value - Untrusted authored text.
   * @returns HTML-safe text content.
   */
  text(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  /**
   * @description Escapes one value for a double-quoted HTML attribute.
   * @param value - Untrusted authored attribute value.
   * @returns HTML-safe attribute content.
   */
  attribute(value: string): string {
    return this.text(value)
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
}
