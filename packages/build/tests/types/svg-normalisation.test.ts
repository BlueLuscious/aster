import type {
  IconDefinition,
  IconIdentity,
} from "@aster/core";
import type { ICollectionMetadataValue } from "../../src/normalisation/contracts/internal/collection-metadata-value.contract.js";
import type { IIconMetadataValue } from "../../src/normalisation/contracts/internal/icon-metadata-value.contract.js";
import type { ISvgNormalisationRequest } from "../../src/normalisation/contracts/internal/svg-normalisation-request.contract.js";
import type { ISvgNormaliser } from "../../src/normalisation/contracts/internal/svg-normaliser.contract.js";

declare const identity: IconIdentity;
declare const request: ISvgNormalisationRequest;
declare const normaliser: ISvgNormaliser;

const collectionMetadata: ICollectionMetadataValue = {
  sourceId: "collections/minimal/metadata/collection.json",
  collection: "minimal",
  presentation: {
    defaults: {},
    overrides: [],
  },
  allowIconLicenceOverride: false,
};

const iconMetadata: IIconMetadataValue = {
  sourceId: "collections/minimal/metadata/camera.json",
  identity,
  displayName: "Camera",
};

const definitions: readonly IconDefinition[] =
  normaliser.normalise(request);

void collectionMetadata;
void iconMetadata;
void definitions;
