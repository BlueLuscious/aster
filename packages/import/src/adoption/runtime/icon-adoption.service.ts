import type {
  IconAdoptionBatchOutput,
  IconAdoptionOutput,
  IconAdoptionRequest,
  IconImportDefinitionRequest,
  IconImportDraft,
  IconModuleEmissionRequest,
  IconModuleOutput,
} from "../contracts/index.js";
import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import type { IconImportSourceType } from "../../source/types/index.js";
import type { IconDefinition, IconMetadata } from "@aster/core";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { diagnosticSeverities } from "../../diagnostic/constants/diagnostic-severities.constant.js";
import { IconImportError } from "../../error/index.js";
import { IconImportAdapterRegistry } from "../../format/runtime/icon-import-adapter.registry.js";
import { IconImportSourceNormaliser } from "../../source/runtime/icon-import-source.normaliser.js";
import { IconIdentityFormatter } from "../../shared/runtime/icon-identity.formatter.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { IconAdoptionDiagnosticFactory } from "./icon-adoption-diagnostic.factory.js";
import { IconImportDefinitionFactory } from "./icon-import-definition.factory.js";
import { IconModuleEmitter } from "./icon-module.emitter.js";

/**
 * @description Coordinates format-neutral source inspection and explicit icon adoption.
 */
export class IconAdoptionService {
  /**
   * @description Immutable registry of built-in source-format adapters.
   */
  readonly #adapters: IconImportAdapterRegistry;

  /**
   * @description Creates one adoption coordinator from an explicit immutable adapter registry.
   * @param adapters - Built-in import adapter registry.
   */
  constructor(adapters: IconImportAdapterRegistry) {
    this.#adapters = adapters;
  }

  /**
   * @description Public source isolation authority.
   */
  readonly #sourceNormaliser = new IconImportSourceNormaliser();

  /**
   * @description Portable definition construction authority.
   */
  readonly #definitionFactory = new IconImportDefinitionFactory();

  /**
   * @description Editable module emission authority.
   */
  readonly #moduleEmitter = new IconModuleEmitter();

  /**
   * @description Diagnostic-bearing result construction authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Adoption diagnostic authority.
   */
  readonly #diagnosticFactory = new IconAdoptionDiagnosticFactory();

  /**
   * @description Canonical unambiguous portable identity formatter.
   */
  readonly #identityFormatter = new IconIdentityFormatter();

  /**
   * @description Primitive public request validation authority.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Inspects one explicit source through its exact format adapter.
   * @param source - Unknown host-provided source at the runtime boundary.
   * @returns Neutral imported draft or blocking diagnostics.
   */
  inspect(source: IconImportSourceType): DiagnosticResultType<IconImportDraft> {
    const canonical = this.#sourceNormaliser.normalise(source);
    return this.#adapters.resolve(canonical.format).inspect(canonical);
  }

  /**
   * @description Combines one accepted draft with complete reviewed metadata.
   * @param request - Draft and metadata construction request.
   * @returns Portable definition or blocking diagnostics.
   */
  define(
    request: IconImportDefinitionRequest,
  ): DiagnosticResultType<IconDefinition> {
    const record = this.#request(request, ["draft", "metadata"]);
    const draft = this.#validator.record(record.draft, "request.draft");
    const provenance = this.#validator.record(
      draft.provenance,
      "request.draft.provenance",
    );
    this.#validator.nonEmptyString(
      provenance.sourceId,
      "request.draft.provenance.sourceId",
    );

    return this.#definitionFactory.create({
      draft: record.draft as IconImportDraft,
      metadata: record.metadata as IconMetadata,
    });
  }

  /**
   * @description Emits one accepted definition as an editable TypeScript module.
   * @param request - Definition and source provenance.
   * @returns Editable module or blocking diagnostics.
   */
  emit(
    request: IconModuleEmissionRequest,
  ): DiagnosticResultType<IconModuleOutput> {
    const record = this.#request(request, ["definition", "sourceIds"]);

    return this.#moduleEmitter.emit({
      definition: record.definition as IconDefinition,
      sourceIds: this.#validator.array(record.sourceIds, "request.sourceIds") as string[],
    });
  }

  /**
   * @description Adopts one explicit source without filesystem or process effects.
   * @param request - Source and complete reviewed metadata.
   * @returns Complete adoption output or blocking diagnostics.
   */
  adopt(
    request: IconAdoptionRequest,
  ): DiagnosticResultType<IconAdoptionOutput> {
    const record = this.#request(request, ["source", "metadata"]);
    const inspected = this.inspect(record.source as IconImportSourceType);

    if (!inspected.successful) {
      return inspected;
    }

    const defined = this.define({
      draft: inspected.value,
      metadata: record.metadata as IconMetadata,
    });

    if (!defined.successful) {
      return this.#resultFactory.failure([
        ...inspected.diagnostics,
        ...defined.diagnostics,
      ]);
    }

    const emitted = this.emit({
      definition: defined.value,
      sourceIds: [inspected.value.provenance.sourceId],
    });

    if (!emitted.successful) {
      return this.#resultFactory.failure([
        ...inspected.diagnostics,
        ...defined.diagnostics,
        ...emitted.diagnostics,
      ]);
    }

    return this.#resultFactory.success(Object.freeze({
      draft: inspected.value,
      definition: defined.value,
      module: emitted.value,
    }), [
      ...inspected.diagnostics,
      ...defined.diagnostics,
      ...emitted.diagnostics,
    ]);
  }

  /**
   * @description Adopts several independent sources atomically in canonical identity order.
   * @param requests - Non-empty adoption request sequence.
   * @returns Complete canonical batch or all blocking diagnostics.
   */
  adoptMany(
    requests: readonly IconAdoptionRequest[],
  ): DiagnosticResultType<IconAdoptionBatchOutput> {
    const acceptedRequests = this.#validator.array(requests, "requests");

    if (acceptedRequests.length === 0) {
      throw new IconImportError("requests", "expected at least one adoption request");
    }

    const entries: IconAdoptionOutput[] = [];
    const diagnostics: SourceDiagnostic[] = [];

    for (const request of acceptedRequests) {
      const adopted = this.adopt(request as IconAdoptionRequest);
      diagnostics.push(...adopted.diagnostics);

      if (adopted.successful) {
        entries.push(adopted.value);
      }
    }

    if (
      diagnostics.some(
        (diagnostic) => diagnostic.severity === diagnosticSeverities.error,
      )
    ) {
      return this.#resultFactory.failure(diagnostics);
    }

    this.#inspectBatchCollisions(entries, diagnostics);

    if (
      diagnostics.some(
        (diagnostic) => diagnostic.severity === diagnosticSeverities.error,
      )
    ) {
      return this.#resultFactory.failure(diagnostics);
    }

    entries.sort((left, right) => {
      const leftIdentity = this.#identityKey(left);
      const rightIdentity = this.#identityKey(right);
      return leftIdentity < rightIdentity ? -1 : leftIdentity > rightIdentity ? 1 : 0;
    });

    return this.#resultFactory.success(Object.freeze({
      entries: Object.freeze(entries),
    }), diagnostics);
  }

  /**
   * @description Detects portable identity and exported symbol collisions.
   * @param entries - Successful candidate adoptions.
   * @param diagnostics - Mutable local diagnostic collector.
   * @returns Nothing.
   */
  #inspectBatchCollisions(
    entries: readonly IconAdoptionOutput[],
    diagnostics: SourceDiagnostic[],
  ): void {
    const identities = new Set<string>();
    const symbols = new Set<string>();

    for (const entry of entries) {
      const sourceId = entry.draft.provenance.sourceId;
      const identity = this.#identityKey(entry);

      if (identities.has(identity)) {
        diagnostics.push(this.#diagnosticFactory.duplicateIdentity(sourceId));
      }

      if (symbols.has(entry.module.symbol)) {
        diagnostics.push(this.#diagnosticFactory.duplicateSymbol(sourceId));
      }

      identities.add(identity);
      symbols.add(entry.module.symbol);
    }
  }

  /**
   * @description Resolves one complete portable identity key.
   * @param entry - Successful adoption entry.
   * @returns Slash-separated identity key.
   */
  #identityKey(entry: IconAdoptionOutput): string {
    return this.#identityFormatter.format(entry.definition.identity);
  }

  /**
   * @description Accepts one exact plain public operation request.
   * @param value - Unknown request supplied through the public API.
   * @param fields - Exact fields owned by the operation.
   * @returns Accepted request record.
   */
  #request(value: unknown, fields: readonly string[]): Record<string, unknown> {
    const record = this.#validator.record(value, "request");
    this.#validator.exactFields(record, fields, "request");
    return record;
  }
}
