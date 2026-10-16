import { Collection, Icon } from "../../src/index.js";
import type { IconDefinition, IconVariantMap } from "../../src/index.js";

declare const outline: IconDefinition;
declare const filledDotted: IconDefinition;
declare const optional: { camera?: { outline?: IconDefinition } };

const collection = Collection.define({
  identity: { name: "typed" },
  icons: { camera: { outline, filledDotted }, constructor: { outline } },
  metadata: { displayName: "Typed" },
});
const group: IconVariantMap = collection.icons.camera;
const selected: IconDefinition = collection.icons.camera.filledDotted;
const member: IconDefinition | undefined = collection.members[0];
const property: string = Icon.variantPropertyName("filled-dotted");
const optionalCollection = Collection.define({
  identity: { name: "optional" }, icons: optional, metadata: { displayName: "Optional" },
});
const maybe: IconDefinition | undefined = optionalCollection.icons.camera?.outline;

// @ts-expect-error Unknown outer aliases are not added by the canonical output.
collection.icons.bell;
// @ts-expect-error Unknown treatments are not added by the canonical output.
collection.icons.camera.filled;
// @ts-expect-error A variant group is not a renderable definition.
const notAnIcon: IconDefinition = collection.icons.camera;
// @ts-expect-error Canonical group selections are readonly.
collection.icons.camera.outline = outline;
// @ts-expect-error Canonical outer aliases are readonly.
collection.icons.camera = { outline, filledDotted };
// @ts-expect-error Optional inner selections stay optional.
const required: IconDefinition = optionalCollection.icons.camera!.outline;
// @ts-expect-error Flat maps no longer satisfy collection membership.
Collection.define({ identity: { name: "flat" }, icons: { camera: outline }, metadata: { displayName: "Flat" } });

void [group, selected, member, property, maybe, notAnIcon, required];
