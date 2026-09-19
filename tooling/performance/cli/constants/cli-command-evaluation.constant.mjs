/**
 * @description Immutable fresh-process command-evaluation protocol and representative workflows.
 */
export const cliCommandEvaluation = Object.freeze({
  /** @description Process-global symbol key retaining disposable module evaluations. */
  evaluationSymbolKey: "aster.tooling.cli-command-module-evaluations",
  /** @description Workspace-relative executable probe path. */
  probePath: "tooling/performance/cli/cli-command-evaluation-probe.mjs",
  /** @description Number of independent fresh processes retained per command workflow. */
  sampleCount: 5,
  /** @description Package distributions attributed independently by the probe. */
  packagePaths: Object.freeze({
    /** @description Workspace-relative CLI package root. */
    cli: "packages/cli",
    /** @description Workspace-relative Icons package root. */
    icons: "packages/icons",
  }),
  /** @description Representative built-in catalogue workflows measured before lazy migration. */
  scenarios: Object.freeze({
    /** @description Icon-list discovery workflow. */
    list: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.evaluation.list-icons",
      /** @description Complete host-neutral invocation. */
      invocation: Object.freeze({ command: "list", subject: "icons" }),
    }),
    /** @description Mixed catalogue search workflow. */
    search: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.evaluation.search-camera",
      /** @description Complete host-neutral invocation. */
      invocation: Object.freeze({ command: "search", query: "camera" }),
    }),
    /** @description Exact icon metadata workflow. */
    show: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.evaluation.show-camera",
      /** @description Complete host-neutral invocation. */
      invocation: Object.freeze({
        command: "show",
        subject: "icon",
        identity: "aster/camera",
      }),
    }),
    /** @description Exact icon SVG export-planning workflow. */
    export: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.evaluation.export-camera",
      /** @description Complete host-neutral invocation. */
      invocation: Object.freeze({
        command: "export",
        subject: "icon",
        identity: "aster/camera",
        options: Object.freeze({}),
      }),
    }),
    /** @description Exact icon static-review planning workflow. */
    review: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.evaluation.review-camera",
      /** @description Complete host-neutral invocation. */
      invocation: Object.freeze({
        command: "review",
        subject: "icon",
        identity: "aster/camera",
      }),
    }),
  }),
});
