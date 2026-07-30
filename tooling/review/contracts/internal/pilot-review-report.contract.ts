/**
 * @description Deterministic automated evidence for the canonical Aster pilot collection.
 */
export interface IPilotReviewReport {
  /**
   * @description Version of the review report representation.
   */
  readonly schemaVersion: 1;

  /**
   * @description Development command that reproduces the evidence.
   */
  readonly generatedBy: string;

  /**
   * @description Canonical package source from which definitions were read.
   */
  readonly source: string;

  /**
   * @description Canonical collection identity under review.
   */
  readonly collection: string;

  /**
   * @description Aggregate technical facts and finding counts.
   */
  readonly summary: Readonly<{
    /** @description Number of direct collection members. */
    iconCount: number;
    /** @description Number of blocking automated findings. */
    blockingFindings: number;
    /** @description Number of advisory automated findings. */
    advisoryFindings: number;
    /** @description Lowest primitive count in one member. */
    minimumPrimitives: number;
    /** @description Highest primitive count in one member. */
    maximumPrimitives: number;
  }>;

  /**
   * @description Construction-role groups used for adjacent visual comparison.
   */
  readonly comparisons: Readonly<Record<string, readonly string[]>>;

  /**
   * @description Per-icon declarative geometry and presentation evidence.
   */
  readonly icons: readonly Readonly<{
    /** @description Fully qualified portable icon identity. */
    identity: string;
    /** @description Human-readable icon name. */
    displayName: string;
    /** @description Declared geometry bounds in viewBox units. */
    bounds: Readonly<{
      /** @description Lowest observed horizontal coordinate. */
      minX: number;
      /** @description Lowest observed vertical coordinate. */
      minY: number;
      /** @description Highest observed horizontal coordinate. */
      maxX: number;
      /** @description Highest observed vertical coordinate. */
      maxY: number;
      /** @description Precision available from the portable geometry representation. */
      basis: "exact" | "control-envelope";
    }>;
    /** @description Ratio of the bounds rectangle to total viewBox area. */
    occupiedAreaRatio: number;
    /** @description Distance from each bounds edge to its nominal safe guide. */
    safeZoneDistance: Readonly<{
      /** @description Distance from the top safe guide. */
      top: number;
      /** @description Distance from the right safe guide. */
      right: number;
      /** @description Distance from the bottom safe guide. */
      bottom: number;
      /** @description Distance from the left safe guide. */
      left: number;
    }>;
    /** @description Grid-alignment facts for declared construction values. */
    anchors: Readonly<{
      /** @description Number of inspected coordinate and radius values. */
      total: number;
      /** @description Number not aligned to the configured subdivision. */
      offGrid: number;
      /** @description Configured subdivision in viewBox units. */
      gridStep: number;
    }>;
    /** @description Number of direct portable geometry nodes. */
    primitives: number;
    /** @description Counts grouped by portable geometry discriminator. */
    primitiveKinds: Readonly<Record<string, number>>;
    /** @description Number of explicit path command groups. */
    pathCommands: number;
    /** @description Effective stroke widths found across the definition. */
    strokeWidths: readonly number[];
    /** @description Whether every effective stroke width agrees. */
    strokeConsistent: boolean;
  }>[];

  /**
   * @description Automated blocking or advisory observations.
   */
  readonly findings: readonly Readonly<{
    /** @description Stable review-local finding code. */
    code: string;
    /** @description Whether the observation blocks technical acceptance. */
    severity: "blocking" | "advisory";
    /** @description Collection or fully qualified icon identity owning the observation. */
    scope: string;
    /** @description Stable explanation of the observed condition. */
    message: string;
  }>[];

  /**
   * @description Explicit limits preventing automated evidence from claiming aesthetic authority.
   */
  readonly limitations: readonly string[];
}
