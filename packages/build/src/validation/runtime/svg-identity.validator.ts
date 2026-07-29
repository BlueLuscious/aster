import type { IconIdentity } from "@aster/core";
import type {
  SourceDiagnostic,
  SourceSpan,
} from "../../diagnostic/contracts/index.js";
import type { IPairedSvgValidationEntry } from "../contracts/internal/paired-svg-validation-entry.contract.js";
import type { ISvgValidationUnit } from "../contracts/internal/svg-validation-unit.contract.js";
import type { TSvgIdentityValidation } from "../types/internal/svg-identity-validation.type.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Resolves required metadata counterparts and validates every acquired identity boundary.
 */
export class SvgIdentityValidator {
  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Applies collection, path, counterpart, and duplicate identity invariants.
   * @param unit - Complete independently acquired validation unit.
   * @returns Blocking identity diagnostics and all unambiguous source pairs.
   */
  inspect(unit: ISvgValidationUnit): TSvgIdentityValidation {
    const diagnostics: SourceDiagnostic[] = [];
    const pairs: IPairedSvgValidationEntry[] = [];
    const collection = unit.collectionMetadata.collection;
    const svgByIdentity = new Map<
      string,
      (typeof unit.entries)[number]
    >();
    const metadataByIdentity = new Map<
      string,
      (typeof unit.iconMetadata)[number]
    >();

    if (unit.collectionContract.collection !== collection) {
      diagnostics.push(
        this.#disagreement(unit.collectionMetadata.sourceId),
      );
    }

    if (unit.entries.length === 0) {
      diagnostics.push(
        this.#diagnosticFactory.create({
          kind: "empty-geometry",
          sourceId: unit.collectionMetadata.sourceId,
        }),
      );
    }

    for (const metadata of unit.iconMetadata) {
      const key = this.#identityKey(metadata.identity);
      const first = metadataByIdentity.get(key);

      if (
        metadata.identity.collection !== collection ||
        !metadata.sourceId.startsWith(
          `collections/${collection}/metadata/`,
        )
      ) {
        diagnostics.push(this.#disagreement(metadata.sourceId));
      }

      if (first !== undefined) {
        diagnostics.push(
          this.#duplicate(
            metadata.sourceId,
            first.sourceId,
            undefined,
            undefined,
          ),
        );
      } else {
        metadataByIdentity.set(key, metadata);
      }
    }

    for (const entry of unit.entries) {
      const key = this.#identityKey(entry.source.identity);
      const first = svgByIdentity.get(key);
      const metadata = metadataByIdentity.get(key);

      if (
        entry.source.identity.collection !== collection ||
        entry.document.sourceId !== entry.source.sourceId ||
        entry.source.sourceId !==
          this.#expectedSourceId(entry.source.identity)
      ) {
        diagnostics.push(
          this.#disagreement(
            entry.source.sourceId,
            entry.document.root.nameSpan,
          ),
        );
      }

      if (first !== undefined) {
        diagnostics.push(
          this.#duplicate(
            entry.source.sourceId,
            first.source.sourceId,
            entry.document.root.nameSpan,
            first.document.root.nameSpan,
          ),
        );
      } else {
        svgByIdentity.set(key, entry);
      }

      if (metadata === undefined) {
        diagnostics.push(
          this.#disagreement(
            entry.source.sourceId,
            entry.document.root.nameSpan,
          ),
        );
      } else {
        pairs.push(
          Object.freeze({
            source: entry.source,
            document: entry.document,
            metadata,
          }),
        );
      }
    }

    for (const metadata of unit.iconMetadata) {
      if (!svgByIdentity.has(this.#identityKey(metadata.identity))) {
        diagnostics.push(this.#disagreement(metadata.sourceId));
      }
    }

    return Object.freeze({
      diagnostics: Object.freeze(diagnostics),
      entries: Object.freeze(pairs),
    });
  }

  /**
   * @description Creates one identity-disagreement diagnostic.
   * @param sourceId - Canonical logical source identifier.
   * @param span - Trustworthy primary source evidence when available.
   * @returns Immutable blocking identity diagnostic.
   */
  #disagreement(
    sourceId: string,
    span?: SourceSpan,
  ): SourceDiagnostic {
    return this.#diagnosticFactory.create({
      kind: "identity-disagreement",
      sourceId,
      ...(span === undefined ? {} : { span }),
    });
  }

  /**
   * @description Creates one duplicate-identity diagnostic with first-occurrence evidence.
   * @param sourceId - Duplicate source identifier.
   * @param firstSourceId - First occurrence source identifier.
   * @param span - Duplicate source evidence when available.
   * @param firstSpan - First occurrence evidence when available.
   * @returns Immutable blocking duplicate diagnostic.
   */
  #duplicate(
    sourceId: string,
    firstSourceId: string,
    span: SourceSpan | undefined,
    firstSpan: SourceSpan | undefined,
  ): SourceDiagnostic {
    return this.#diagnosticFactory.create({
      kind: "duplicate-identity",
      sourceId,
      ...(span === undefined ? {} : { span }),
      related: [
        {
          message: "First occurrence of the canonical identity.",
          sourceId: firstSourceId,
          ...(firstSpan === undefined ? {} : { span: firstSpan }),
        },
      ],
    });
  }

  /**
   * @description Creates one unambiguous key for counterpart and duplicate resolution.
   * @param identity - Canonical source identity.
   * @returns Stable collection, icon, and variant key.
   */
  #identityKey(identity: IconIdentity): string {
    return `${identity.collection}/${identity.name}/${identity.variant ?? ""}`;
  }

  /**
   * @description Derives the exact accepted canonical SVG source identifier.
   * @param identity - Independently acquired canonical identity.
   * @returns Repository-relative canonical SVG source identifier.
   */
  #expectedSourceId(identity: IconIdentity): string {
    const variant =
      identity.variant === undefined ? "" : `--${identity.variant}`;
    return `collections/${identity.collection}/svg/${identity.name}${variant}.svg`;
  }
}
