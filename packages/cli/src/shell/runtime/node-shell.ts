import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import type { AsterCommandInvocationType, AsterCommandResultType } from "../../command/types/index.js";
import type { AsterVersionScopeType } from "../../command/types/aster-version-scope.type.js";
import { asterPackageVersionSources } from "../../command/constants/aster-package-version-sources.constant.js";
import { AsterCatalogue, AsterCommands } from "../../index.js";
import { ReviewDocumentSerialiser } from "../../review/runtime/review-document.serialiser.js";
import { reviewOutputSchema } from "../output/constants/review-output-schema.constant.js";
import { ExportOutputPathResolver } from "../output/runtime/export-output-path.resolver.js";
import { ExportOutputPublisher } from "../output/runtime/export-output.publisher.js";
import { NodeOutputFileSystem } from "../output/runtime/node-output-file-system.js";
import { OutputError } from "../output/runtime/output.error.js";
import { OutputLocationResolver } from "../output/runtime/output-location.resolver.js";
import { ReviewOutputPathResolver } from "../output/runtime/review-output-path.resolver.js";
import { ReviewOutputPublisher } from "../output/runtime/review-output.publisher.js";
import { commandLineTokens } from "../parsing/constants/command-line-tokens.constant.js";
import { CommandLineError } from "../parsing/runtime/command-line.error.js";
import { CommandLineParser } from "../parsing/runtime/command-line.parser.js";
import { CliPackageVersionError } from "../version/runtime/cli-package-version.error.js";
import { ProjectPackageVersionError } from "../version/runtime/project-package-version.error.js";
import { CommandOutputPresenter } from "../presentation/runtime/command-output.presenter.js";
import type { TShellExecution } from "../presentation/types/internal/shell-execution.type.js";
import { ShellDiagnosticFactory } from "./shell-diagnostic.factory.js";

/**
 * @description Coordinates argv adaptation, explicit Aster composition, and pure presentation.
 */
export class NodeShell {
  /**
   * @description Standalone argv adapter.
   */
  readonly #parser = new CommandLineParser();

  /**
   * @description Structured result to stream-effect presenter.
   */
  readonly #output = new CommandOutputPresenter();

  /**
   * @description Shell-owned fault to structured diagnostic adapter.
   */
  readonly #diagnostics = new ShellDiagnosticFactory();

  /**
   * @description Shared private Node filesystem authority for standalone publishers.
   */
  readonly #fileSystem = new NodeOutputFileSystem();

  /**
   * @description Shared safe output-root resolution authority.
   */
  readonly #locations = new OutputLocationResolver();

  /**
   * @description Private Node output composition applied only to complete export plans.
   */
  readonly #exportPublisher = new ExportOutputPublisher(
    this.#fileSystem,
    this.#locations,
    new ExportOutputPathResolver(),
  );

  /**
   * @description Private Node publication composition for complete static review plans.
   */
  readonly #reviewPublisher = new ReviewOutputPublisher(
    this.#fileSystem,
    new ReviewOutputPathResolver(this.#locations),
    new ReviewDocumentSerialiser(),
  );

  /**
   * @description Explicit absolute host directory used for output-root resolution.
   */
  readonly #currentDirectory: string;

  /**
   * @description Installed entrypoint URL used as the package-resolution base.
   */
  readonly #entrypoint: URL;

  /**
   * @description Explicit immutable command context owned by this executable composition.
   */
  readonly #context;

  /**
   * @description Creates one standalone shell with explicit product metadata.
   * @param productName - Stable product name for the version command.
   * @param productVersion - Installed package version for the version command.
   * @param currentDirectory - Explicit absolute host directory for output resolution.
   * @param entrypoint - Installed CLI entrypoint used for package-version resolution.
   */
  constructor(
    productName: string,
    productVersion: string,
    currentDirectory: string,
    entrypoint: URL,
  ) {
    this.#currentDirectory = currentDirectory;
    this.#entrypoint = new URL(entrypoint.href);
    this.#context = Object.freeze({
      catalogues: Object.freeze([AsterCatalogue]),
      productName,
      productVersion,
    });
  }

  /**
   * @description Executes one supplied argv sequence without directly mutating process state.
   * @param argv - Tokens following the executable and script paths.
   * @returns Complete stream effects and exit status for the entrypoint to commit.
   * @remarks The command boundary validates raw export tokens before executing a request.
   */
  async execute(argv: readonly string[]): Promise<TShellExecution> {
    const json = argv.includes(commandLineTokens.options.json);
    let outputCommand:
      | typeof asterCommandNames.export
      | typeof asterCommandNames.review
      | undefined;

    try {
      const parsed = this.#parser.parse(argv);
      const invocation = parsed.invocation;
      const context = invocation.command === asterCommandNames.version
        && (invocation.dependencies === true
          || invocation.location === true
          || (invocation.scope !== undefined && invocation.scope !== "cli"))
        ? await this.#versionContext(invocation)
        : this.#context;
      const result = await AsterCommands.execute(
        invocation as AsterCommandInvocationType,
        context,
      );

      if (
        !parsed.json
        && result.ok
        && result.payload.kind === asterCommandPayloadKinds.review
      ) {
        outputCommand = asterCommandNames.review;
        const publication = await this.#reviewPublisher.publish(
          result.payload.plan,
          this.#currentDirectory,
          parsed.output ?? reviewOutputSchema.defaultRoot,
          parsed.replace ?? false,
        );
        return this.#output.presentReviewPublication(publication);
      }

      if (
        parsed.output !== undefined
        && result.ok
        && result.payload.kind === asterCommandPayloadKinds.export
      ) {
        outputCommand = asterCommandNames.export;
        const publication = await this.#exportPublisher.publish(
          result.payload.plan,
          this.#currentDirectory,
          parsed.output,
        );
        return this.#output.presentPublication(publication);
      }

      return this.#output.present(result, parsed.json);
    } catch (error) {
      const result = this.#diagnose(error, outputCommand);
      return this.#output.present(result, json);
    }
  }

  /**
   * @description Selects the stable shell diagnostic for a caught host-boundary failure.
   * @param error - Unknown failure from parsing, output publication, or version acquisition.
   * @param outputCommand - Output command identified before a publication failure.
   * @returns Safe structured failure without native exception details.
   */
  #diagnose(
    error: unknown,
    outputCommand: typeof asterCommandNames.export | typeof asterCommandNames.review | undefined,
  ): AsterCommandResultType {
    if (error instanceof CommandLineError) {
      return this.#diagnostics.usage(error);
    }

    if (error instanceof OutputError && outputCommand !== undefined) {
      return this.#diagnostics.output(error, outputCommand);
    }

    if (error instanceof ProjectPackageVersionError || error instanceof CliPackageVersionError) {
      return this.#diagnostics.packageVersion(error);
    }

    return this.#diagnostics.unexpected();
  }

  /**
   * @description Acquires the requested project or executed-CLI evidence lazily.
   * @param invocation - Accepted version request requiring installed manifest evidence.
   * @returns Immutable command context with only the requested host evidence.
   */
  async #versionContext(
    invocation: Extract<AsterCommandInvocationType, { command: typeof asterCommandNames.version }>,
  ): Promise<AsterCommandContext> {
    const cliLocation = invocation.location === true
      ? await this.#readCliLocation()
      : undefined;

    if (invocation.dependencies === true) {
      const cli = invocation.scope === undefined || invocation.scope === "cli";
      const groups = cli
        ? await this.#readCliDependencies()
        : await this.#readProjectDependencies(invocation.scope);
      return Object.freeze({
        ...this.#context,
        packageDependencies: Object.freeze({
          source: cli ? asterPackageVersionSources.cli : asterPackageVersionSources.project,
          groups,
        }),
        ...(cliLocation === undefined ? {} : { cliLocation }),
      });
    }

    if (invocation.scope === undefined || invocation.scope === "cli") {
      return Object.freeze({
        ...this.#context,
        ...(cliLocation === undefined ? {} : { cliLocation }),
      });
    }

    const { ProjectPackageVersionReader } = await import(
      "../version/runtime/project-package-version.reader.js"
    );
    const packages = await new ProjectPackageVersionReader(this.#currentDirectory).read(invocation.scope);
    const packageVersions = Object.freeze({ source: asterPackageVersionSources.project, packages });
    return Object.freeze({ ...this.#context, packageVersions });
  }

  /**
   * @description Acquires the executed CLI root and its direct Aster dependencies lazily.
   * @returns One root group without treating the CLI as its own dependency.
   */
  async #readCliDependencies() {
    const { CliPackageVersionReader } = await import(
      "../version/runtime/cli-package-version.reader.js"
    );
    const group = await new CliPackageVersionReader(this.#entrypoint).readDependencies();
    return Object.freeze([group]);
  }

  /**
   * @description Acquires each selected project root's direct dependencies lazily.
   * @param scope - Named library or all directly installed project packages.
   * @returns Independent root groups in canonical order.
   */
  async #readProjectDependencies(scope: AsterVersionScopeType) {
    const { ProjectPackageVersionReader } = await import(
      "../version/runtime/project-package-version.reader.js"
    );
    return new ProjectPackageVersionReader(this.#currentDirectory).readDependencies(scope);
  }

  /**
   * @description Reads the loaded CLI module path only for an explicit location request.
   * @returns Executed entrypoint and direct project CLI comparison.
   */
  async #readCliLocation() {
    const { CliLocationReader } = await import("../version/runtime/cli-location.reader.js");
    return new CliLocationReader(this.#entrypoint, this.#currentDirectory).read();
  }
}
