import { asterCommandPayloadKinds } from "../../../command/constants/aster-command-payload-kinds.constant.js";
import { asterPackageVersionSources } from "../../../command/constants/aster-package-version-sources.constant.js";
import { asterCliLocationStatuses } from "../../../command/constants/aster-cli-location-statuses.constant.js";
import { commandDiagnosticSchema } from "../../../command/constants/command-diagnostic-schema.constant.js";
import { asterCommandSubjects } from "../../../command/constants/aster-command-subjects.constant.js";
import type { AsterCliLocationEvidence } from "../../../command/contracts/aster-cli-location-evidence.contract.js";
import type {
  AsterCommandDiagnosticDetailsType,
  AsterCommandResultType,
  AsterCommandShowSubjectType,
} from "../../../command/types/index.js";
import type { TExportOutputPublication } from "../../output/types/internal/export-output-publication.type.js";
import type { TReviewOutputPublication } from "../../output/types/internal/review-output-publication.type.js";
import { CatalogueHumanOutputPresenter } from "./catalogue-human-output.presenter.js";
import { ExportHumanOutputPresenter } from "./export-human-output.presenter.js";
import { HelpHumanOutputPresenter } from "./help-human-output.presenter.js";
import { HumanTextFormatter } from "./human-text.formatter.js";
import { ReviewHumanOutputPresenter } from "./review-human-output.presenter.js";

/**
 * @description Dispatches structured command results to deterministic human-text collaborators.
 */
export class HumanOutputPresenter {
  /**
   * @description Catalogue discovery payload presenter.
   */
  readonly #catalogue = new CatalogueHumanOutputPresenter();

  /**
   * @description Export plan and publication presenter.
   */
  readonly #export = new ExportHumanOutputPresenter();

  /**
   * @description Command help presenter.
   */
  readonly #help = new HelpHumanOutputPresenter();

  /**
   * @description Review-plan presenter.
   */
  readonly #review = new ReviewHumanOutputPresenter();

  /**
   * @description Shared deterministic sequence and human-data formatter.
   */
  readonly #text = new HumanTextFormatter();

  /**
   * @description Renders truthful destination evidence after output publication handling.
   * @param publication - Immutable publication result from the private output host.
   * @returns Plain deterministic publication summary without a final newline.
   */
  publication(publication: TExportOutputPublication): string {
    return this.#export.publication(publication);
  }

  /**
   * @description Renders one committed static review destination.
   * @param publication - Immutable review publication evidence.
   * @returns Plain deterministic publication summary without a final newline.
   */
  reviewPublication(publication: TReviewOutputPublication): string {
    return this.#review.publication(publication);
  }

  /**
   * @description Renders one successful command result without a final newline.
   * @param result - Structured immutable successful command result.
   * @returns Plain deterministic success text.
   */
  success(
    result: Extract<
      AsterCommandResultType,
      {
        /** @description Successful-result discriminator used for outcome narrowing. */
        ok: true;
      }
    >,
  ): string {
    const payload = result.payload;
    const location = Object.hasOwn(payload, "location") && "location" in payload
      ? payload.location
      : undefined;

    switch (payload.kind) {
      case asterCommandPayloadKinds.export:
        return this.#export.plan(payload.plan);
      case asterCommandPayloadKinds.review:
        return this.#review.plan(payload.plan);
      case asterCommandPayloadKinds.catalogueList:
      case asterCommandPayloadKinds.collectionList:
      case asterCommandPayloadKinds.iconList:
      case asterCommandPayloadKinds.glyphList:
      case asterCommandPayloadKinds.glyphShow:
      case asterCommandPayloadKinds.search:
      case asterCommandPayloadKinds.iconShow:
      case asterCommandPayloadKinds.collectionShow:
        return this.#catalogue.present(payload);
      case asterCommandPayloadKinds.help:
        return this.#help.present(payload.descriptors);
      case asterCommandPayloadKinds.version:
        return [
          `${payload.productName} ${payload.productVersion}`,
          ...this.#locationLines(location),
        ].join("\n");
      case asterCommandPayloadKinds.packageVersions:
        if (!Object.hasOwn(payload, "aggregate") || payload.aggregate !== true) {
          return [
            `${payload.packages[0]?.name} ${payload.packages[0]?.version}`,
            ...this.#locationLines(location),
          ].join("\n");
        }

        return [
          "Project Aster packages:",
          ...(payload.packages.length === 0
            ? ["  (none)"]
            : payload.packages.map(({ name, version }) => `  ${name} ${version}`)),
        ].join("\n");
      case asterCommandPayloadKinds.packageDependencies:
        return [
          payload.source === asterPackageVersionSources.cli
            ? "Executed CLI dependencies:"
            : "Project Aster package dependencies:",
          ...(payload.groups.length === 0
            ? ["  (none)"]
            : payload.groups.flatMap(({ root, dependencies }, index) => [
              ...(index === 0 ? [] : [""]),
              `${root.name} ${root.version}`,
              ...(dependencies.length === 0
                ? ["  (no Aster dependencies)"]
                : dependencies.map(({ name, version }) => `  ${name} ${version}`)),
            ])),
          ...(location === undefined ? [] : ["", ...this.#locationLines(location)]),
        ].join("\n");
    }
  }

  /**
   * @description Presents opt-in executed-CLI module and project comparison evidence.
   * @param location - Explicitly requested location evidence, when present.
   * @returns Human location lines without a trailing newline.
   */
  #locationLines(location: AsterCliLocationEvidence | undefined): readonly string[] {
    if (location === undefined) {
      return [];
    }

    const comparison = {
      [asterCliLocationStatuses.same]: "same installation as the project CLI",
      [asterCliLocationStatuses.different]: "different installation from the project CLI",
      [asterCliLocationStatuses.absent]: "no directly installed project CLI",
      [asterCliLocationStatuses.noProject]: "no current project",
      [asterCliLocationStatuses.unavailable]: "comparison unavailable",
    }[location.projectCli];

    return [`CLI module: ${location.entrypoint}`, `Project CLI: ${comparison}`];
  }

  /**
   * @description Renders one failed command result without a final newline.
   * @remarks Supporting facts are labelled under Details using their explicit roles, never message
   * wording. Controls are escaped without altering the structured diagnostic or its evidence order.
   * @param result - Structured immutable failed command result.
   * @returns Plain deterministic diagnostic text.
   */
  failure(
    result: Extract<
      AsterCommandResultType,
      {
        /** @description Failed-result discriminator used for outcome narrowing. */
        ok: false;
      }
    >,
  ): string {
    const diagnostic = result.diagnostic;
    const details = Object.hasOwn(diagnostic, "details")
      ? diagnostic.details
      : undefined;
    return [
      `[${diagnostic.code}] ${this.#text.value(diagnostic.message)}`,
      ...(details === undefined
        ? []
        : [this.#text.sequence("Details", this.#detailLines(details))]),
    ].join("\n");
  }

  /**
   * @description Presents accepted supporting facts using the labels owned by their semantic roles.
   * @param details - Immutable producer-supplied facts with an explicit role discriminator.
   * @returns Ordered detail lines before indentation beneath the Details heading.
   */
  #detailLines(details: AsterCommandDiagnosticDetailsType): readonly string[] {
    switch (details.kind) {
      case commandDiagnosticSchema.details.catalogues:
        return this.#catalogueLines(details.catalogues);
      case commandDiagnosticSchema.details.catalogue:
        return [`Catalogue: ${this.#text.value(details.catalogue)}`];
      case commandDiagnosticSchema.details.lookup:
        return [
          `${this.#subjectLabel(details.subject)}: ${this.#text.value(details.identity)}`,
        ];
      case commandDiagnosticSchema.details.ambiguity:
        return [
          `${this.#subjectLabel(details.subject)}: ${this.#text.value(details.identity)}`,
          ...this.#catalogueLines(details.catalogues),
        ];
      case commandDiagnosticSchema.details.definition:
        return [
          `Catalogue: ${this.#text.value(details.catalogue)}`,
          `${this.#subjectLabel(details.selection.kind)}: ${this.#text.value(details.selection.identity)}`,
          ...(Object.hasOwn(details, "member") && details.member !== undefined
            ? [`Member icon: ${this.#text.value(details.member)}`]
            : []),
        ];
      case commandDiagnosticSchema.details.exportRender:
      case commandDiagnosticSchema.details.pathConflict:
        return [`Artefact path: ${this.#text.value(details.path)}`];
      case commandDiagnosticSchema.details.reviewRender:
        return [`Icon: ${this.#text.value(details.icon)}`];
    }
  }

  /**
   * @description Presents provider identities without deduplicating or sorting their evidence.
   * @param catalogues - Ordered provider identities belonging to one diagnostic.
   * @returns Heading and nested provider lines, with an explicit empty marker when appropriate.
   */
  #catalogueLines(catalogues: readonly string[]): readonly string[] {
    return [
      "Catalogues:",
      ...(catalogues.length === 0
        ? ["  (none)"]
        : catalogues.map((catalogue) => `  ${this.#text.value(catalogue)}`)),
    ];
  }

  /**
   * @description Selects the human label for an explicitly identified lookup or selection family.
   * @param subject - Accepted semantic subject, independent of a diagnostic's prose.
   * @returns Stable singular human label.
   */
  #subjectLabel(
    subject:
      | AsterCommandShowSubjectType
      | typeof commandDiagnosticSchema.catalogueSubject,
  ): string {
    switch (subject) {
      case commandDiagnosticSchema.catalogueSubject:
        return "Catalogue";
      case asterCommandSubjects.show.icon:
        return "Icon";
      case asterCommandSubjects.show.glyph:
        return "Glyph";
      case asterCommandSubjects.show.collection:
        return "Collection";
    }
  }
}
