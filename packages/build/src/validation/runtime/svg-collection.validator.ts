import type { IconViewBox } from "@aster/core";
import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { ICollectionValidationContract } from "../contracts/internal/collection-validation-contract.contract.js";
import type { ISvgValidationEntry } from "../contracts/internal/svg-validation-entry.contract.js";
import type { TSvgValidationMetrics } from "../types/internal/svg-validation-metrics.type.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Applies accepted collection-owned visual rules without inferring artistic quality.
 */
export class SvgCollectionValidator {
  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Applies configured collection rules to safely computed technical facts.
   * @param entry - Canonical source pair and parsed syntax.
   * @param metrics - Safely computed technical facts.
   * @param contract - Accepted collection-owned rule authority.
   * @returns Collection diagnostics in deterministic semantic encounter order.
   */
  inspect(
    entry: ISvgValidationEntry,
    metrics: TSvgValidationMetrics,
    contract: ICollectionValidationContract,
  ): readonly SourceDiagnostic[] {
    const diagnostics: SourceDiagnostic[] = [];
    const sourceId = entry.source.sourceId;

    if (
      contract.viewBox !== undefined &&
      metrics.viewBox !== undefined &&
      !this.#sameViewBox(
        metrics.viewBox.value,
        contract.viewBox.expected,
      )
    ) {
      diagnostics.push(
        this.#diagnosticFactory.create({
          kind: "collection-view-box",
          severity: contract.viewBox.severity,
          sourceId,
          span: metrics.viewBox.span,
        }),
      );
    }

    if (contract.stroke !== undefined) {
      for (const stroke of metrics.strokeWidths) {
        if (!contract.stroke.acceptedWidths.includes(stroke.value)) {
          diagnostics.push(
            this.#diagnosticFactory.create({
              kind: "collection-stroke",
              severity: contract.stroke.severity,
              sourceId,
              span: stroke.span,
            }),
          );
        }
      }
    }

    if (contract.grid !== undefined) {
      for (const located of metrics.gridValues) {
        if (!this.#onGrid(located.value, contract.grid.step)) {
          diagnostics.push(
            this.#diagnosticFactory.create({
              kind: "collection-grid",
              severity: contract.grid.severity,
              sourceId,
              span: located.span,
            }),
          );
        }
      }
    }

    if (
      contract.bounds !== undefined &&
      metrics.viewBox !== undefined
    ) {
      const { minX, minY, width, height } = metrics.viewBox.value;
      const [left, top, right, bottom] = contract.bounds.inset;
      const safeMinX = minX + left;
      const safeMinY = minY + top;
      const safeMaxX = minX + width - right;
      const safeMaxY = minY + height - bottom;

      for (const measured of metrics.bounds) {
        if (
          measured.minX < safeMinX ||
          measured.minY < safeMinY ||
          measured.maxX > safeMaxX ||
          measured.maxY > safeMaxY
        ) {
          diagnostics.push(
            this.#diagnosticFactory.create({
              kind: "collection-bounds",
              severity: contract.bounds.severity,
              sourceId,
              span: measured.span,
            }),
          );
        }
      }
    }

    if (
      contract.complexity !== undefined &&
      (metrics.primitiveCount > contract.complexity.maxPrimitives ||
        metrics.pathCommandCount >
          contract.complexity.maxPathCommands)
    ) {
      diagnostics.push(
        this.#diagnosticFactory.create({
          kind: "collection-complexity",
          severity: contract.complexity.severity,
          sourceId,
          span: entry.document.root.span,
        }),
      );
    }

    return Object.freeze(diagnostics);
  }

  /**
   * @description Compares canonical coordinate systems exactly after technical parsing.
   * @param left - First canonical coordinate system.
   * @param right - Second canonical coordinate system.
   * @returns Whether every coordinate-system field agrees.
   */
  #sameViewBox(left: IconViewBox, right: IconViewBox): boolean {
    return (
      left.minX === right.minX &&
      left.minY === right.minY &&
      left.width === right.width &&
      left.height === right.height
    );
  }

  /**
   * @description Tests one finite authored value against a positive construction step.
   * @param value - Parsed finite geometry value.
   * @param step - Accepted positive collection grid step.
   * @returns Whether the value lies on the grid within numeric-operation tolerance.
   */
  #onGrid(value: number, step: number): boolean {
    const ratio = value / step;
    return Math.abs(ratio - Math.round(ratio)) <= 1e-9;
  }
}
