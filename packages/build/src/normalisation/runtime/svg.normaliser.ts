import {
  Icon,
  type IconDefinition,
  type IconIdentity,
  type IconNodeType,
  type IconPresentation,
} from "@aster/core";
import type { IIconMetadataValue } from "../contracts/internal/icon-metadata-value.contract.js";
import type { ISvgNormalisationRequest } from "../contracts/internal/svg-normalisation-request.contract.js";
import type { ISvgNormaliser } from "../contracts/internal/svg-normaliser.contract.js";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { IconMetadataComposer } from "./icon-metadata.composer.js";
import { SvgPresentationNormaliser } from "./svg-presentation.normaliser.js";
import { SvgPrimitiveNormaliser } from "./svg-primitive.normaliser.js";

/**
 * @description Converts accepted SVG evidence and decoded metadata into Core-owned definitions.
 */
export class SvgNormaliser implements ISvgNormaliser {
  /**
   * @description Inherited SVG presentation resolution authority.
   */
  readonly #presentationNormaliser = new SvgPresentationNormaliser();

  /**
   * @description Supported primitive conversion authority.
   */
  readonly #primitiveNormaliser = new SvgPrimitiveNormaliser();

  /**
   * @description Collection and icon metadata composition authority.
   */
  readonly #metadataComposer = new IconMetadataComposer();

  /**
   * @description Normalises one complete successful validation unit.
   * @param request - Validated SVG evidence and linked structured metadata.
   * @returns Canonically ordered deeply immutable portable icon definitions.
   */
  normalise(request: ISvgNormalisationRequest): readonly IconDefinition[] {
    this.#validateCollectionMetadata(request);
    const metadataBySource = this.#metadataBySource(request);
    const definitions = request.evidence.entries.map((entry) => {
      const metadata = metadataBySource.get(entry.metadata.sourceId);
      const viewBox = entry.metrics.viewBox?.value;

      if (metadata === undefined) {
        throw new BuildContractError(
          "request.iconMetadata",
          "every validated icon metadata source requires one structured value",
        );
      }

      if (viewBox === undefined) {
        throw new BuildContractError(
          "request.evidence.entries.metrics.viewBox",
          "validated viewBox evidence is unavailable",
        );
      }

      if (!this.#identitiesMatch(entry.source.identity, metadata.identity)) {
        throw new BuildContractError(
          "request.iconMetadata.identity",
          "must match validated SVG identity",
        );
      }

      return Icon.define({
        identity: entry.source.identity,
        viewBox,
        nodes: this.#nodes(entry.document.root),
        metadata: this.#metadataComposer.compose(
          request.collectionMetadata,
          metadata,
        ),
      });
    });

    return Object.freeze(definitions);
  }

  /**
   * @description Validates the structured collection value's link to successful evidence.
   * @param request - Complete normalisation request.
   * @returns Nothing.
   */
  #validateCollectionMetadata(request: ISvgNormalisationRequest): void {
    if (
      request.collectionMetadata.sourceId !==
      request.evidence.collectionMetadata.sourceId
    ) {
      throw new BuildContractError(
        "request.collectionMetadata.sourceId",
        "must match validated collection metadata source",
      );
    }

    if (
      request.collectionMetadata.collection !==
      request.evidence.collectionMetadata.collection
    ) {
      throw new BuildContractError(
        "request.collectionMetadata.collection",
        "must match validated collection identity",
      );
    }
  }

  /**
   * @description Indexes structured icon metadata while rejecting duplicates and unrelated values.
   * @param request - Complete normalisation request.
   * @returns Structured metadata indexed by validated source identifier.
   */
  #metadataBySource(
    request: ISvgNormalisationRequest,
  ): ReadonlyMap<string, IIconMetadataValue> {
    const acceptedSources = new Set(
      request.evidence.entries.map((entry) => entry.metadata.sourceId),
    );
    const values = new Map<string, IIconMetadataValue>();

    for (const metadata of request.iconMetadata) {
      if (!acceptedSources.has(metadata.sourceId)) {
        throw new BuildContractError(
          "request.iconMetadata.sourceId",
          "does not belong to successful validation evidence",
        );
      }

      if (values.has(metadata.sourceId)) {
        throw new BuildContractError(
          "request.iconMetadata.sourceId",
          "must be unique",
        );
      }

      values.set(metadata.sourceId, metadata);
    }

    return values;
  }

  /**
   * @description Flattens structural syntax into portable nodes in exact paint order.
   * @param root - Safe validated SVG root.
   * @returns Ordered explicit portable geometry nodes.
   */
  #nodes(root: ISvgSyntaxElement): readonly IconNodeType[] {
    const nodes: IconNodeType[] = [];

    /**
     * @description Visits one source element while carrying inherited portable presentation.
     * @param element - Current safe validated source element.
     * @param inherited - Presentation inherited from structural ancestors.
     * @returns Nothing.
     */
    const visit = (
      element: ISvgSyntaxElement,
      inherited: IconPresentation,
    ): void => {
      const presentation = this.#presentationNormaliser.normalise(
        element,
        inherited,
      );

      if (element.localName !== "svg" && element.localName !== "g") {
        nodes.push(
          this.#primitiveNormaliser.normalise(element, presentation),
        );
      }

      for (const child of element.children) {
        visit(child, presentation);
      }
    };

    visit(root, Object.freeze({}));
    return Object.freeze(nodes);
  }

  /**
   * @description Compares complete logical icon identities.
   * @param left - First canonical identity.
   * @param right - Second canonical identity.
   * @returns Whether collection, name, and optional variant match.
   */
  #identitiesMatch(left: IconIdentity, right: IconIdentity): boolean {
    return (
      left.collection === right.collection &&
      left.name === right.name &&
      left.variant === right.variant
    );
  }
}
