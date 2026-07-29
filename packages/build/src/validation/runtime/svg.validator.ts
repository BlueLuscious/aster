import type { IconIdentity } from "@aster/core";
import type { ISvgValidationEvidence } from "../contracts/internal/svg-validation-evidence.contract.js";
import type { ISvgValidationUnit } from "../contracts/internal/svg-validation-unit.contract.js";
import type { ISvgValidator } from "../contracts/internal/svg-validator.contract.js";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { CollectionValidationContractFactory } from "./collection-validation-contract.factory.js";
import { SvgCollectionValidator } from "./svg-collection.validator.js";
import { SvgIdentityValidator } from "./svg-identity.validator.js";
import { SvgTechnicalValidator } from "./svg-technical.validator.js";

/**
 * @description Composes universal technical validity with accepted collection-owned rule authority.
 */
export class SvgValidator implements ISvgValidator {
  /**
   * @description Diagnostic-bearing result construction authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Accepted immutable collection-rule construction authority.
   */
  readonly #contractFactory = new CollectionValidationContractFactory();

  /**
   * @description Source and metadata identity relationship authority.
   */
  readonly #identityValidator = new SvgIdentityValidator();

  /**
   * @description Universal blocking SVG validity authority.
   */
  readonly #technicalValidator = new SvgTechnicalValidator();

  /**
   * @description Collection-owned visual rule authority.
   */
  readonly #collectionValidator = new SvgCollectionValidator();

  /**
   * @description Validates one complete configured generation unit.
   * @param unit - Acquired source pairs and accepted collection rules.
   * @returns Complete validation evidence with advisories, or blocking diagnostics without output.
   */
  validate(
    unit: ISvgValidationUnit,
  ): ReturnType<ISvgValidator["validate"]> {
    const collectionContract = this.#contractFactory.create(
      unit.collectionContract,
    );
    const acceptedUnit = {
      collectionMetadata: unit.collectionMetadata,
      entries: unit.entries,
      iconMetadata: unit.iconMetadata,
      collectionContract,
    };
    const identity = this.#identityValidator.inspect(acceptedUnit);
    const diagnostics = [...identity.diagnostics];
    const metricsBySource = new Map<
      (typeof unit.entries)[number]["source"],
      ReturnType<SvgTechnicalValidator["inspect"]>["metrics"]
    >();

    for (const entry of unit.entries) {
      const technical = this.#technicalValidator.inspect(entry);
      metricsBySource.set(entry.source, technical.metrics);
      diagnostics.push(...technical.diagnostics);
      diagnostics.push(
        ...this.#collectionValidator.inspect(
          entry,
          technical.metrics,
          collectionContract,
        ),
      );
    }

    if (
      diagnostics.some(
        (diagnostic) => diagnostic.severity === "error",
      )
    ) {
      return this.#resultFactory.failure<ISvgValidationEvidence>(
        diagnostics,
      );
    }

    const entries = identity.entries
      .map((entry) => ({
        entry,
        metrics: metricsBySource.get(entry.source),
      }))
      .sort((left, right) =>
        this.#compareIdentity(
          left.entry.source.identity,
          right.entry.source.identity,
        ),
      )
      .map(({ entry, metrics }) => {
        if (metrics === undefined) {
          throw new BuildContractError(
            "unit.entries",
            "validation metrics are unavailable for a resolved SVG source",
          );
        }

        return Object.freeze({
          source: entry.source,
          document: entry.document,
          metadata: entry.metadata,
          metrics,
        });
      });
    const evidence = Object.freeze({
      collectionMetadata: unit.collectionMetadata,
      collectionContract,
      entries: Object.freeze(entries),
    });

    return this.#resultFactory.success(evidence, diagnostics);
  }

  /**
   * @description Compares canonical identities without locale-sensitive behaviour.
   * @param left - First canonical source identity.
   * @param right - Second canonical source identity.
   * @returns Negative, zero, or positive canonical ordering value.
   */
  #compareIdentity(left: IconIdentity, right: IconIdentity): number {
    return (
      this.#compareText(left.collection, right.collection) ||
      this.#compareText(left.name, right.name) ||
      this.#compareText(left.variant ?? "", right.variant ?? "")
    );
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text.
   * @param right - Second text.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
