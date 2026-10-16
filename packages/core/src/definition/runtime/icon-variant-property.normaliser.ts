import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/** @description Derives one portable property name from an explicitly validated treatment slug. */
export class IconVariantPropertyNormaliser {
  /** @description Primitive authored text acceptance authority. */
  readonly #validator = new IconValueValidator();

  /** @description Open portable treatment slug grammar. */
  readonly #slugs = new CanonicalSlugNormaliser();

  /**
   * @description Validates a treatment and derives its lower camel-case property without selecting an icon.
   * @param value - Candidate treatment slug.
   * @param path - Logical path used for deterministic validation failures.
   * @returns Canonical property, retaining valid digit-led segments.
   */
  normalise(value: unknown, path = "variant"): string {
    const slug = this.#slugs.normalise(this.#validator.text(value, path), path);
    return slug.split("-").map((part, index) =>
      index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    ).join("");
  }
}
