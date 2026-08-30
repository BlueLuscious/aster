import { IconImport, iconImportFormats } from "@aster/import";
import { importBaseline } from "../constants/import-baseline.constant.mjs";

/**
 * @description Prepares representative public Import inputs outside timed work.
 */
export class ImportBaselineFixtureFactory {
  /**
   * @description Creates one immutable Import scenario fixture matrix.
   * @returns {import("../contracts/internal/import-baseline-fixtures.contract.mjs").IImportBaselineFixtures} Prepared public Import inputs.
   */
  create() {
    const minimalContent = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">',
      '  <path d="M4 12h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />',
      "</svg>",
    ].join("\n");
    const editorContent = [
      '<?xml version="1.0" encoding="utf-8"?>',
      "<!-- Generator: representative vector editor export -->",
      '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">',
      '  <line fill="none" stroke="#000000" stroke-miterlimit="10" x1="12" x2="20.5" y1="12" y2="12" />',
      '  <ellipse fill="none" stroke="#000000" stroke-miterlimit="10" cx="12" cy="12" rx="9" ry="4" />',
      "  <g></g>",
      "</svg>",
    ].join("\n");
    const rejectedContent = [
      '<svg xmlns="http://www.w3.org/2000/svg">',
      "  <script>run()</script>",
      "</svg>",
    ].join("\n");
    const mediumContent = this.#scaledContent(
      importBaseline.scales.mediumSourceElements,
    );
    const largeContent = this.#scaledContent(
      importBaseline.scales.largeSourceElements,
    );
    const minimalSource = this.#source("minimal", minimalContent);
    const editorSource = this.#source("editor", editorContent);
    const rejectedSource = this.#source("rejected", rejectedContent);
    const mediumSource = this.#source("medium", mediumContent);
    const largeSource = this.#source("large", largeContent);
    const metadata = this.#metadata("Benchmark Minimal");
    const inspection = IconImport.inspect(minimalSource);

    if (!inspection.successful) {
      throw new TypeError("The Import benchmark requires an accepted minimal SVG fixture.");
    }

    const definitionRequest = {
      draft: inspection.value,
      metadata,
    };
    const definitionResult = IconImport.define(definitionRequest);

    if (!definitionResult.successful) {
      throw new TypeError("The Import benchmark requires an accepted definition fixture.");
    }

    const adoptionRequest = {
      source: minimalSource,
      metadata,
    };
    const batchRequests = this.#batchRequests(
      importBaseline.batchSize,
      "batch",
      minimalContent,
    );
    const largeBatchRequests = this.#batchRequests(
      importBaseline.scales.largeBatchSize,
      "large-batch",
      minimalContent,
    );

    return Object.freeze({
      minimalSource,
      editorSource,
      rejectedSource,
      mediumSource,
      largeSource,
      definitionRequest,
      emissionRequest: {
        definition: definitionResult.value,
        sourceIds: [minimalSource.sourceId],
      },
      adoptionRequest,
      batchRequests,
      largeBatchRequests,
      sizes: Object.freeze({
        minimalSourceBytes: Buffer.byteLength(minimalContent),
        editorSourceBytes: Buffer.byteLength(editorContent),
        rejectedSourceBytes: Buffer.byteLength(rejectedContent),
        mediumSourceBytes: Buffer.byteLength(mediumContent),
        mediumSourceElements: importBaseline.scales.mediumSourceElements,
        largeSourceBytes: Buffer.byteLength(largeContent),
        largeSourceElements: importBaseline.scales.largeSourceElements,
        batchSize: batchRequests.length,
        largeBatchSize: largeBatchRequests.length,
      }),
    });
  }

  /**
   * @description Creates one accepted SVG source with a controlled number of equivalent geometry elements.
   * @param {number} elementCount - Positive geometry element count owned by the benchmark configuration.
   * @returns {string} Deterministic SVG source used for source-size scaling evidence.
   */
  #scaledContent(elementCount) {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">',
      ...Array.from(
        { length: elementCount },
        (_, index) =>
          `  <path d="M${index % 12} 12h8" stroke="currentColor" />`,
      ),
      "</svg>",
    ].join("\n");
  }

  /**
   * @description Creates one immutable batch with unique portable identities and equivalent source complexity.
   * @param {number} requestCount - Positive request count owned by the benchmark configuration.
   * @param {string} prefix - Identity prefix distinguishing the benchmark scale.
   * @param {string} content - Exact accepted SVG source shared by the requests.
   * @returns {readonly import("@aster/import").IconAdoptionRequest[]} Immutable host-owned batch inputs.
   */
  #batchRequests(requestCount, prefix, content) {
    return Object.freeze(
      Array.from({ length: requestCount }, (_, index) => ({
        source: this.#source(`${prefix}-${index}`, content),
        metadata: this.#metadata(`Benchmark ${prefix} ${index}`),
      })),
    );
  }

  /**
   * @description Creates one benchmark-local host-owned SVG source.
   * @param {string} name - Distinct portable icon name.
   * @param {string} content - Exact decoded SVG source.
   * @returns {import("@aster/import").SvgIconImportSource} Prepared mutable source input.
   */
  #source(name, content) {
    return {
      format: iconImportFormats.svg,
      sourceId: `benchmark/${name}.svg`,
      identity: { namespace: "benchmark", name },
      content,
    };
  }

  /**
   * @description Creates complete reviewed metadata for one benchmark adoption.
   * @param {string} displayName - Human-readable benchmark identity.
   * @returns {import("@aster/core").IconMetadata} Prepared mutable metadata input.
   */
  #metadata(displayName) {
    return {
      displayName,
      tags: ["benchmark", "import"],
      rtl: "preserve",
      presentation: {
        defaults: {},
        overrides: [],
      },
      deprecated: false,
    };
  }
}
