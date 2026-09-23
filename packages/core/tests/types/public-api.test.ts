import {
  Collection,
  Icon,
  IconDefinitionError,
  iconDirections,
  iconNodeKinds,
  iconPaintSchema,
  iconPresentationOverrideOrder,
  iconRtlPolicies,
  iconTechnicalPresentation,
} from "../../src/index.js";
import type {
  CollectionDefinition,
  CollectionDefinitionInput,
  IconDefinition,
  IconFillRuleType,
} from "../../src/index.js";

const camera = Icon.define({
  identity: {
    namespace: "minimal",
    name: "camera",
  },
  viewBox: {
    minX: 0,
    minY: 0,
    width: 24,
    height: 24,
  },
  nodes: [
    {
      kind: "circle",
      cx: 12,
      cy: 12,
      radius: 4,
    },
  ],
  metadata: {
    displayName: "Camera",
    rtl: "preserve",
    presentation: {
      defaults: {
        fill: "none",
        stroke: "currentColor",
      },
      overrides: ["stroke"],
    },
    deprecated: false,
  },
});

const acceptedDefinition: IconDefinition = camera;
const cameraStippled = Icon.define({
  ...camera,
  identity: {
    namespace: "minimal",
    name: "camera",
    variant: "stippled",
  },
});
const externalCamera = Icon.define({
  ...camera,
  identity: {
    namespace: "external",
    name: "camera",
  },
});
const collection = Collection.define({
  identity: {
    name: "minimal",
  },
  icons: { camera },
  metadata: {
    displayName: "Minimal",
    tags: ["interface-icons"],
  },
});
const cameraCollection = Collection.define({
  identity: {
    name: "cameras",
  },
  icons: {
    camera,
    cameraStippled,
    externalCamera,
  },
  metadata: {
    displayName: "Cameras",
  },
});
const emptyCollection = Collection.define({
  identity: {
    name: "empty",
  },
  icons: {},
  metadata: {
    displayName: "Empty",
  },
});
const acceptedCollection: CollectionDefinition = collection;
const revalidatedCollection = Collection.define(collection);
const acceptedCollectionInput: CollectionDefinitionInput<{ camera: IconDefinition }> = {
  identity: collection.identity,
  icons: collection.icons,
  metadata: collection.metadata,
};
const exactCamera: IconDefinition = collection.icons.camera;
const revalidatedCamera: IconDefinition = revalidatedCollection.icons.camera;
const orderedCamera: IconDefinition | undefined = collection.members[0];
const cameraAlias: keyof typeof collection.icons = "camera";
const variantAlias: keyof typeof cameraCollection.icons = "cameraStippled";
const namespaceAlias: keyof typeof cameraCollection.icons = "externalCamera";
type EmptyCollectionAlias = keyof typeof emptyCollection.icons;
type AssertNever<Value extends never> = Value;
type EmptyCollectionHasNoAliases = AssertNever<EmptyCollectionAlias>;
// @ts-expect-error Concrete collection aliases reject unknown property access.
collection.icons.search;
// @ts-expect-error Canonical collection alias maps are readonly.
collection.icons.camera = camera;
// @ts-expect-error Concrete collection aliases reject unknown keys.
const unknownAlias: keyof typeof collection.icons = "search";
const pathKind: typeof iconNodeKinds.path = "path";
const direction: (typeof iconDirections)[number] = "rtl";
const rtlPolicy: (typeof iconRtlPolicies)[number] = "mirror";
const paintKeyword: (typeof iconPaintSchema.keywords)[number] = "currentColor";
const fillRule: IconFillRuleType = "evenodd";
const override: (typeof iconPresentationOverrideOrder)[number] = "strokeWidth";
const technicalFill = iconTechnicalPresentation.fill;
const definitionError = new IconDefinitionError("definition", "expected valid data");
const definitionErrorCode: typeof IconDefinitionError.code = definitionError.code;

Icon.define({
  ...camera,
  // @ts-expect-error The public API accepts no target-specific definition fields.
  renderer: "svg",
});

void acceptedDefinition;
void acceptedCollection;
void revalidatedCollection;
void acceptedCollectionInput;
void exactCamera;
void revalidatedCamera;
void orderedCamera;
void cameraAlias;
void variantAlias;
void namespaceAlias;
void emptyCollection;
void (undefined as EmptyCollectionHasNoAliases);
void unknownAlias;
void pathKind;
void direction;
void rtlPolicy;
void paintKeyword;
void fillRule;
void override;
void technicalFill;
void definitionErrorCode;
