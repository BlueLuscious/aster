import type {
  CollectionDefinition,
  IconDefinition,
  IconNodeType,
} from "@aster/core";
import { iconTechnicalPresentation } from "@aster/core";
import { pilotReviewConfig } from "../constants/pilot-review-config.constant.js";
import type { IPilotReviewReport } from "../contracts/internal/pilot-review-report.contract.js";
import { PilotPathGeometryAnalyser } from "./pilot-path-geometry.analyser.js";

/**
 * @description Produces deterministic technical evidence from portable pilot definitions.
 */
export class PilotGeometryAnalyser {
  /**
   * @description Path-specific declarative geometry analyser.
   */
  readonly #pathAnalyser = new PilotPathGeometryAnalyser();

  /**
   * @description Analyses every direct member of one immutable collection.
   * @param collection - Canonical collection under review.
   * @returns Deeply frozen automated review report.
   */
  analyse(collection: CollectionDefinition): IPilotReviewReport {
    const collectionIdentity = this.#identity(collection.identity);
    const findings: Array<IPilotReviewReport["findings"][number]> = [];
    const icons = collection.icons.map((definition) =>
      this.#analyseIcon(definition, findings),
    );
    const primitives = icons.map((icon) => icon.primitives);
    const memberNames = new Set(
      collection.icons.map((definition) => definition.identity.name),
    );

    for (const [role, names] of Object.entries(
      pilotReviewConfig.comparisons,
    )) {
      for (const name of names) {
        if (!memberNames.has(name)) {
          findings.push({
            code: "ASTER-REVIEW-007",
            severity: "blocking",
            scope: collectionIdentity,
            message: `Comparison role ${role} references unavailable icon ${name}.`,
          });
        }
      }
    }

    findings.sort(
      (left, right) =>
        left.severity.localeCompare(right.severity) ||
        left.code.localeCompare(right.code) ||
        left.scope.localeCompare(right.scope),
    );

    return this.#freeze({
      schemaVersion: 1,
      generatedBy: pilotReviewConfig.generatedBy,
      source: pilotReviewConfig.source,
      collection: collectionIdentity,
      summary: {
        iconCount: icons.length,
        blockingFindings: findings.filter(
          (finding) => finding.severity === "blocking",
        ).length,
        advisoryFindings: findings.filter(
          (finding) => finding.severity === "advisory",
        ).length,
        minimumPrimitives: Math.min(...primitives),
        maximumPrimitives: Math.max(...primitives),
      },
      comparisons: pilotReviewConfig.comparisons,
      icons,
      findings,
      limitations: [
        "Path bounds are control-point envelopes, not exact painted curve bounds.",
        "Occupied area is the geometry-bounds rectangle, not rasterised ink coverage.",
        "Stroke expansion, optical balance, recognisability, and negative-space quality require human review.",
        "Automated findings describe technical drift and never assign aesthetic quality.",
      ],
    });
  }

  /**
   * @description Produces review evidence for one portable icon.
   * @param definition - Canonical portable icon definition.
   * @param findings - Mutable report finding accumulator.
   * @returns Immutable per-icon metrics.
   */
  #analyseIcon(
    definition: IconDefinition,
    findings: Array<IPilotReviewReport["findings"][number]>,
  ): IPilotReviewReport["icons"][number] {
    const identity = this.#identity(definition.identity);
    const nodeEvidence = definition.nodes.map((node) =>
      this.#nodeEvidence(node),
    );
    const bounds = [
      Math.min(...nodeEvidence.map((evidence) => evidence.bounds[0])),
      Math.min(...nodeEvidence.map((evidence) => evidence.bounds[1])),
      Math.max(...nodeEvidence.map((evidence) => evidence.bounds[2])),
      Math.max(...nodeEvidence.map((evidence) => evidence.bounds[3])),
    ] as const;
    const basis = nodeEvidence.some(
      (evidence) => evidence.basis === "control-envelope",
    )
      ? "control-envelope"
      : "exact";
    const anchors = nodeEvidence.flatMap((evidence) => evidence.anchors);
    const offGrid = anchors.filter(
      (anchor) =>
        !Number.isInteger(anchor / pilotReviewConfig.gridStep),
    ).length;
    const primitiveKinds: Record<string, number> = {};

    for (const node of definition.nodes) {
      primitiveKinds[node.kind] = (primitiveKinds[node.kind] ?? 0) + 1;
    }

    const defaultStrokeWidth =
      definition.metadata.presentation.defaults.strokeWidth ??
      iconTechnicalPresentation.strokeWidth;
    const strokeWidths = [
      ...new Set(
        definition.nodes.map(
          (node) => node.strokeWidth ?? defaultStrokeWidth,
        ),
      ),
    ].sort((left, right) => left - right);
    const strokeConsistent = strokeWidths.length === 1;
    const viewBoxRight = definition.viewBox.minX + definition.viewBox.width;
    const viewBoxBottom = definition.viewBox.minY + definition.viewBox.height;
    const safeLeft = definition.viewBox.minX + pilotReviewConfig.safeInset;
    const safeTop = definition.viewBox.minY + pilotReviewConfig.safeInset;
    const safeRight = viewBoxRight - pilotReviewConfig.safeInset;
    const safeBottom = viewBoxBottom - pilotReviewConfig.safeInset;
    const safeZoneDistance = {
      top: this.#round(bounds[1] - safeTop),
      right: this.#round(safeRight - bounds[2]),
      bottom: this.#round(safeBottom - bounds[3]),
      left: this.#round(bounds[0] - safeLeft),
    };
    const outsideViewBox =
      bounds[0] < definition.viewBox.minX ||
      bounds[1] < definition.viewBox.minY ||
      bounds[2] > viewBoxRight ||
      bounds[3] > viewBoxBottom;
    const outsideSafeZone = Object.values(safeZoneDistance).some(
      (distance) => distance < 0,
    );
    const pathCommands = nodeEvidence.reduce(
      (total, evidence) => total + evidence.pathCommands,
      0,
    );

    if (
      definition.viewBox.minX !== pilotReviewConfig.contract.viewBox.minX ||
      definition.viewBox.minY !== pilotReviewConfig.contract.viewBox.minY ||
      definition.viewBox.width !==
        pilotReviewConfig.contract.viewBox.width ||
      definition.viewBox.height !==
        pilotReviewConfig.contract.viewBox.height
    ) {
      findings.push({
        code: "ASTER-REVIEW-001",
        severity: "blocking",
        scope: identity,
        message: `ViewBox differs from the provisional ${Object.values(pilotReviewConfig.contract.viewBox).join(" ")} contract.`,
      });
    }

    if (
      !strokeConsistent ||
      strokeWidths[0] !== pilotReviewConfig.contract.strokeWidth
    ) {
      findings.push({
        code: "ASTER-REVIEW-002",
        severity: "blocking",
        scope: identity,
        message: `Effective stroke widths differ from the provisional ${pilotReviewConfig.contract.strokeWidth}-unit contract.`,
      });
    }

    if (offGrid > 0) {
      findings.push({
        code: "ASTER-REVIEW-003",
        severity: "advisory",
        scope: identity,
        message: `${offGrid} construction values are outside the ${pilotReviewConfig.gridStep}-unit subdivision.`,
      });
    }

    if (outsideViewBox) {
      findings.push({
        code: "ASTER-REVIEW-004",
        severity: basis === "exact" ? "blocking" : "advisory",
        scope: identity,
        message:
          basis === "exact"
            ? "Exact declared geometry bounds cross the viewBox."
            : "A path control envelope crosses the viewBox and requires visual confirmation.",
      });
    }

    if (outsideSafeZone) {
      findings.push({
        code: "ASTER-REVIEW-005",
        severity: "advisory",
        scope: identity,
        message: "Declared geometry crosses at least one nominal safe-area guide.",
      });
    }

    if (
      definition.nodes.length >
        pilotReviewConfig.contract.maximumPrimitives ||
      pathCommands > pilotReviewConfig.contract.maximumPathCommands
    ) {
      findings.push({
        code: "ASTER-REVIEW-006",
        severity: "advisory",
        scope: identity,
        message: "Declarative geometry exceeds a provisional complexity guide.",
      });
    }

    return this.#freeze({
      identity,
      displayName: definition.metadata.displayName,
      bounds: {
        minX: this.#round(bounds[0]),
        minY: this.#round(bounds[1]),
        maxX: this.#round(bounds[2]),
        maxY: this.#round(bounds[3]),
        basis,
      },
      occupiedAreaRatio: this.#round(
        ((bounds[2] - bounds[0]) * (bounds[3] - bounds[1])) /
          (definition.viewBox.width * definition.viewBox.height),
      ),
      safeZoneDistance,
      anchors: {
        total: anchors.length,
        offGrid,
        gridStep: pilotReviewConfig.gridStep,
      },
      primitives: definition.nodes.length,
      primitiveKinds,
      pathCommands,
      strokeWidths,
      strokeConsistent,
    });
  }

  /**
   * @description Extracts bounds, anchors, and path complexity from one geometry node.
   * @param node - Portable geometry node.
   * @returns Declarative node evidence.
   */
  #nodeEvidence(node: IconNodeType): Readonly<{
    bounds: readonly [number, number, number, number];
    anchors: readonly number[];
    basis: "exact" | "control-envelope";
    pathCommands: number;
  }> {
    switch (node.kind) {
      case "path": {
        const evidence = this.#pathAnalyser.analyse(node.data);
        return {
          bounds: evidence.bounds,
          anchors: evidence.anchors,
          basis: "control-envelope",
          pathCommands: evidence.commandCount,
        };
      }
      case "circle":
        return {
          bounds: [
            node.cx - node.radius,
            node.cy - node.radius,
            node.cx + node.radius,
            node.cy + node.radius,
          ],
          anchors: [node.cx, node.cy, node.radius],
          basis: "exact",
          pathCommands: 0,
        };
      case "ellipse":
        return {
          bounds: [
            node.cx - node.radiusX,
            node.cy - node.radiusY,
            node.cx + node.radiusX,
            node.cy + node.radiusY,
          ],
          anchors: [
            node.cx,
            node.cy,
            node.radiusX,
            node.radiusY,
          ],
          basis: "exact",
          pathCommands: 0,
        };
      case "rect":
        return {
          bounds: [
            node.x,
            node.y,
            node.x + node.width,
            node.y + node.height,
          ],
          anchors: [
            node.x,
            node.y,
            node.width,
            node.height,
            ...(node.radiusX === undefined ? [] : [node.radiusX]),
            ...(node.radiusY === undefined ? [] : [node.radiusY]),
          ],
          basis: "exact",
          pathCommands: 0,
        };
      case "line":
        return {
          bounds: [
            Math.min(node.x1, node.x2),
            Math.min(node.y1, node.y2),
            Math.max(node.x1, node.x2),
            Math.max(node.y1, node.y2),
          ],
          anchors: [node.x1, node.y1, node.x2, node.y2],
          basis: "exact",
          pathCommands: 0,
        };
      case "polyline":
      case "polygon": {
        const xValues = node.points.map((point) => point.x);
        const yValues = node.points.map((point) => point.y);
        return {
          bounds: [
            Math.min(...xValues),
            Math.min(...yValues),
            Math.max(...xValues),
            Math.max(...yValues),
          ],
          anchors: node.points.flatMap((point) => [point.x, point.y]),
          basis: "exact",
          pathCommands: 0,
        };
      }
    }
  }

  /**
   * @description Formats one icon or collection identity without consulting membership.
   * @param identity - Portable namespace, name, and optional variant fields.
   * @returns Stable `/`-separated identity.
   */
  #identity(identity: {
    readonly namespace?: string;
    readonly name: string;
    readonly variant?: string;
  }): string {
    return [
      ...(identity.namespace === undefined ? [] : [identity.namespace]),
      identity.name,
      ...(identity.variant === undefined ? [] : [identity.variant]),
    ].join("/");
  }

  /**
   * @description Canonicalises one report number to four fractional decimal places.
   * @param value - Finite computed metric.
   * @returns Canonical finite number.
   */
  #round(value: number): number {
    return Object.is(value, -0)
      ? 0
      : Math.round(value * 10_000) / 10_000;
  }

  /**
   * @description Deeply freezes one report-owned value.
   * @typeParam Value - Inferred report value.
   * @param value - Mutable report-owned value.
   * @returns The same deeply frozen value.
   */
  #freeze<Value>(value: Value): Value {
    if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
      return value;
    }

    for (const nested of Object.values(value)) {
      this.#freeze(nested);
    }

    return Object.freeze(value);
  }
}
