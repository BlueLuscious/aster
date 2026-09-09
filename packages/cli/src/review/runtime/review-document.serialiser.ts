import type { IconPresentation } from "@aster/core";
import { CatalogueIdentityFormatter } from "../../catalogue/runtime/catalogue-identity.formatter.js";
import { reviewSubjects } from "../constants/review-subjects.constant.js";
import { reviewDocumentPresentation } from "../constants/review-document-presentation.constant.js";
import { reviewDocumentStyles } from "../constants/review-document-styles.constant.js";
import type {
  AsterCollectionReviewDocument,
  AsterReviewIconEvidence,
  AsterReviewPlan,
} from "../contracts/index.js";
import { HtmlContentEscaper } from "./html-content.escaper.js";

/**
 * @description Serialises complete review plans into deterministic self-contained HTML evidence.
 * @remarks Rendered icon markup is retained from `@aster/svg`; this class never interprets geometry.
 */
export class ReviewDocumentSerialiser {
  /**
   * @description Explicit text and attribute-context escaping authority.
   */
  readonly #html = new HtmlContentEscaper();

  /**
   * @description Canonical portable identity formatter.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Serialises one complete review plan with inline CSS and SVG only.
   * @param plan - Immutable host-neutral review plan.
   * @returns Byte-stable UTF-8-compatible HTML with LF line endings.
   */
  serialise(plan: AsterReviewPlan): string {
    const document = plan.document;
    const title = document.kind === reviewSubjects.icon
      ? document.icon.metadata.displayName
      : document.metadata.displayName;
    const iconCount = document.kind === reviewSubjects.icon
      ? 1
      : document.icons.length;
    const navigation = document.kind === reviewSubjects.collection
      ? document.icons.length === 0
        ? '<li><a href="#contact-sheet">Contact sheet</a></li>'
        : '<li><a href="#contact-sheet">Contact sheet</a></li><li><a href="#icon-details">Icon details</a></li>'
      : `<li><a href="#${this.#html.attribute(this.#anchor(plan.identity))}">Icon details</a></li>`;
    const content = document.kind === reviewSubjects.icon
      ? this.#iconSection(document.icon, 2)
      : this.#collection(document);

    return [
      "<!doctype html>",
      '<html lang="en-GB">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${this.#html.text(title)} | Aster review</title>`,
      `<style>${reviewDocumentStyles}</style>`,
      "</head>",
      "<body>",
      '<header class="review-header">',
      '<p class="review-eyebrow">Aster static review</p>',
      `<h1>${this.#html.text(title)}</h1>`,
      `<p>Technical evidence for <code>${this.#html.text(plan.identity)}</code> from catalogue <code>${this.#html.text(plan.catalogue)}</code>.</p>`,
      "</header>",
      '<nav class="review-nav" aria-label="Review sections"><ul><li><a href="#overview">Overview</a></li>' + navigation + "</ul></nav>",
      '<main class="review-main">',
      '<section class="review-panel" id="overview" aria-labelledby="overview-heading">',
      '<h2 id="overview-heading">Overview</h2>',
      '<dl class="review-summary">',
      this.#datum("Subject", plan.subject),
      this.#datum("Identity", plan.identity),
      this.#datum("Catalogue", plan.catalogue),
      this.#datum("Icons", String(iconCount)),
      "</dl>",
      "</section>",
      content,
      "</main>",
      '<footer class="review-footer">Disposable evidence generated from canonical Aster definitions.</footer>',
      "</body>",
      "</html>",
      "",
    ].join("\n");
  }

  /**
   * @description Serialises collection metadata, contact sheet and member details.
   * @param document - Complete collection review model.
   * @returns Deterministic collection HTML fragment.
   */
  #collection(document: AsterCollectionReviewDocument): string {
    const identity = this.#identities.collection(document.identity);
    const contactSheet = document.icons.length === 0
      ? '<p class="review-empty">This collection contains no icons.</p>'
      : `<div class="review-contact-sheet">${document.icons.map((icon) => this.#contactCard(icon)).join("")}</div>`;
    const details = document.icons.length === 0
      ? ""
      : [
          '<section id="icon-details" aria-labelledby="icon-details-heading">',
          '<h2 id="icon-details-heading">Icon details</h2>',
          ...document.icons.map((icon) => this.#iconSection(icon, 3)),
          "</section>",
        ].join("\n");

    return [
      '<section class="review-panel" aria-labelledby="collection-heading">',
      '<h2 id="collection-heading">Collection evidence</h2>',
      '<dl class="review-summary">',
      this.#datum("Identity", identity),
      this.#datum("Display name", document.metadata.displayName),
      this.#datum("Description", document.metadata.description ?? "Not provided"),
      this.#datum("Licence", document.metadata.licence ?? "Not provided"),
      this.#datum("Attribution", document.metadata.attribution ?? "Not provided"),
      this.#datum("Member count", String(document.icons.length)),
      "</dl>",
      this.#tags(document.metadata.tags),
      "</section>",
      '<section class="review-panel" id="contact-sheet" aria-labelledby="contact-sheet-heading">',
      '<h2 id="contact-sheet-heading">Contact sheet</h2>',
      contactSheet,
      "</section>",
      details,
    ].join("\n");
  }

  /**
   * @description Serialises one navigable contact-sheet entry.
   * @param icon - Complete member evidence.
   * @returns Escaped contact-sheet anchor and decorative SVG.
   */
  #contactCard(icon: AsterReviewIconEvidence): string {
    const identity = this.#identities.icon(icon.identity);
    return `<a class="review-contact-card" href="#${this.#html.attribute(this.#anchor(identity))}">${icon.markup}<span>${this.#html.text(identity)}</span></a>`;
  }

  /**
   * @description Serialises complete visual and technical evidence for one icon.
   * @param icon - Complete icon review evidence.
   * @param headingLevel - Semantic heading level for this context.
   * @returns Deterministic icon detail section.
   */
  #iconSection(icon: AsterReviewIconEvidence, headingLevel: 2 | 3): string {
    const identity = this.#identities.icon(icon.identity);
    const heading = `h${headingLevel}`;
    const detailHeading = headingLevel === 2 ? "h3" : "h4";
    const viewBox = `${icon.viewBox.minX} ${icon.viewBox.minY} ${icon.viewBox.width} ${icon.viewBox.height}`;
    const replacement = icon.metadata.replacedBy === undefined
      ? "Not provided"
      : this.#identities.icon(icon.metadata.replacedBy);
    const memberships = icon.memberships.length === 0
      ? "Standalone icon"
      : icon.memberships.map((membership) => this.#identities.collection(membership)).join(", ");

    return [
      `<article class="review-panel" id="${this.#html.attribute(this.#anchor(identity))}" aria-labelledby="${this.#html.attribute(this.#anchor(identity))}-heading">`,
      `<${heading} id="${this.#html.attribute(this.#anchor(identity))}-heading">${this.#html.text(icon.metadata.displayName)}</${heading}>`,
      `<p><span class="review-badge">${this.#html.text(identity)}</span></p>`,
      '<dl class="review-summary">',
      this.#datum("Identity", identity),
      this.#datum("Description", "No description is retained by the portable icon contract"),
      this.#datum("RTL policy", icon.metadata.rtl),
      this.#datum("View box", viewBox),
      this.#datum("Nodes", String(icon.nodeCount)),
      this.#datum("Primitives", icon.primitiveKinds.join(", ")),
      this.#datum("Collections", memberships),
      this.#datum("Deprecated", icon.metadata.deprecated ? "Yes" : "No"),
      this.#datum("Replacement", replacement),
      this.#datum("Licence", icon.metadata.licence ?? "Not provided"),
      this.#datum("Attribution", icon.metadata.attribution ?? "Not provided"),
      "</dl>",
      this.#tags(icon.metadata.tags),
      `<${detailHeading}>Representative palettes</${detailHeading}>`,
      `<div class="review-palettes">${reviewDocumentPresentation.palettes.map((palette) => `<figure class="review-swatch"><div class="review-canvas ${palette.className}">${icon.markup}</div><figcaption>${this.#html.text(palette.label)}: <code>${this.#html.text(palette.foreground)}</code> on <code>${this.#html.text(palette.background)}</code></figcaption></figure>`).join("")}</div>`,
      `<${detailHeading}>Size ladder</${detailHeading}>`,
      `<div class="review-size-ladder" aria-label="Icon at representative pixel sizes">${reviewDocumentPresentation.sizes.map((size) => `<div class="review-size-sample review-size-${size}">${icon.markup}<span>${size} px</span></div>`).join("")}</div>`,
      `<${detailHeading}>Guides</${detailHeading}>`,
      '<div class="review-guides">',
      `<figure class="review-swatch"><div class="review-canvas review-guide-grid">${icon.markup}</div><figcaption>Regular comparison grid</figcaption></figure>`,
      `<figure class="review-swatch"><div class="review-canvas review-guide-bounds">${icon.markup}</div><figcaption>Viewport bounds comparison</figcaption></figure>`,
      '<div class="review-unavailable"><strong>Safe area</strong><p>No safe-area profile is retained by the portable definition, so this review does not invent one.</p></div>',
      "</div>",
      `<${detailHeading}>Presentation policy</${detailHeading}>`,
      this.#presentation(icon.metadata.presentation.defaults, icon.metadata.presentation.overrides, icon.metadata.presentation.defaultSize, icon.metadata.presentation.minimumSize),
      '<details><summary>Rendered SVG markup</summary>',
      `<pre class="review-code"><code>${this.#html.text(icon.markup)}</code></pre>`,
      "</details>",
      "</article>",
    ].join("\n");
  }

  /**
   * @description Serialises fixed portable presentation policy evidence.
   * @param defaults - Canonical default presentation fields.
   * @param overrides - Canonical caller-overridable field names.
   * @param defaultSize - Optional default viewport size.
   * @param minimumSize - Optional curator-approved minimum size.
   * @returns Escaped presentation definition list.
   */
  #presentation(
    defaults: IconPresentation,
    overrides: readonly string[],
    defaultSize: number | undefined,
    minimumSize: number | undefined,
  ): string {
    const defaultEntries = Object.entries(defaults)
      .map(([field, value]) => `${field}: ${String(value)}`)
      .join(", ");
    return [
      '<dl class="review-summary">',
      this.#datum("Defaults", defaultEntries === "" ? "None" : defaultEntries),
      this.#datum("Overrides", overrides.length === 0 ? "None" : overrides.join(", ")),
      this.#datum("Default size", defaultSize === undefined ? "Not provided" : String(defaultSize)),
      this.#datum("Minimum size", minimumSize === undefined ? "Not provided" : String(minimumSize)),
      "</dl>",
    ].join("\n");
  }

  /**
   * @description Serialises an optional immutable tag sequence.
   * @param tags - Accepted authored tags.
   * @returns Escaped tag list or explicit empty evidence.
   */
  #tags(tags: readonly string[] | undefined): string {
    if (tags === undefined || tags.length === 0) {
      return '<p><strong>Tags:</strong> none</p>';
    }

    return `<ul class="review-tags" aria-label="Tags">${tags.map((tag) => `<li class="review-tag">${this.#html.text(tag)}</li>`).join("")}</ul>`;
  }

  /**
   * @description Serialises one escaped definition-list entry.
   * @param label - Fixed field label.
   * @param value - Potentially authored field value.
   * @returns Complete definition-list fragment.
   */
  #datum(label: string, value: string): string {
    return `<div><dt>${this.#html.text(label)}</dt><dd>${this.#html.text(value)}</dd></div>`;
  }

  /**
   * @description Creates a deterministic fragment identifier from one canonical identity.
   * @param identity - Canonical portable identity text.
   * @returns Stable fragment identifier.
   */
  #anchor(identity: string): string {
    return `icon-${encodeURIComponent(identity)}`;
  }
}
