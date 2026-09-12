import type { AsterCommandDescriptor } from "../contracts/index.js";
import { asterCommandNames } from "./aster-command-names.constant.js";

/**
 * @description Immutable host-neutral help metadata for every initial Aster command definition.
 */
export const asterCommandDescriptors = Object.freeze({
  /** @description Help metadata for deterministic SVG export. */
  export: Object.freeze({
    /** @description Canonical export command identity. */
    name: asterCommandNames.export,
    /** @description Concise purpose shown by general help presentation. */
    summary: "Export one icon or collection as deterministic SVG artefacts.",
    /** @description Complete accepted export invocation forms. */
    usage: Object.freeze([
      "export icon <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] [--label <text>] [--title <text>] [--output <root>]",
      "export collection <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] --output <root>",
      "export icon <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] [--label <text>] [--title <text>] --json",
      "export collection <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] --json",
    ]),
  }),
  /** @description Help metadata for catalogue listing. */
  list: Object.freeze({
    /** @description Canonical list command identity. */
    name: asterCommandNames.list,
    /** @description Concise purpose shown by general help presentation. */
    summary: "List catalogue providers, collections, or icons.",
    /** @description Complete accepted list invocation forms. */
    usage: Object.freeze([
      "list catalogues",
      "list collections [--catalogue <provider>]",
      "list icons [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...",
    ]),
  }),
  /** @description Help metadata for static technical review publication. */
  review: Object.freeze({
    /** @description Canonical review command identity. */
    name: asterCommandNames.review,
    /** @description Concise purpose shown by general help presentation. */
    summary: "Publish static technical and visual evidence for one icon or collection.",
    /** @description Complete accepted review invocation forms. */
    usage: Object.freeze([
      "review icon <identity> [--catalogue <provider>] [--output <root>] [--replace]",
      "review collection <identity> [--catalogue <provider>] [--output <root>] [--replace]",
    ]),
  }),
  /** @description Help metadata for catalogue search. */
  search: Object.freeze({
    /** @description Canonical search command identity. */
    name: asterCommandNames.search,
    /** @description Concise purpose shown by general help presentation. */
    summary: "Search icons and collections in explicit catalogues.",
    /** @description Complete accepted search invocation forms. */
    usage: Object.freeze([
      "search <query> [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...",
    ]),
  }),
  /** @description Help metadata for exact catalogue lookup. */
  show: Object.freeze({
    /** @description Canonical show command identity. */
    name: asterCommandNames.show,
    /** @description Concise purpose shown by general help presentation. */
    summary: "Show one exact icon or collection.",
    /** @description Complete accepted show invocation forms. */
    usage: Object.freeze([
      "show icon <identity> [--catalogue <provider>]",
      "show collection <identity> [--catalogue <provider>]",
    ]),
  }),
  /** @description Help metadata for command grammar discovery. */
  help: Object.freeze({
    /** @description Canonical help command identity. */
    name: asterCommandNames.help,
    /** @description Concise purpose shown by general help presentation. */
    summary: "Show accepted command help metadata.",
    /** @description Complete accepted help invocation forms. */
    usage: Object.freeze(["help", "help <command>"]),
  }),
  /** @description Help metadata for installed product-version discovery. */
  version: Object.freeze({
    /** @description Canonical version command identity. */
    name: asterCommandNames.version,
    /** @description Concise purpose shown by general help presentation. */
    summary: "Show explicit Aster product metadata.",
    /** @description Complete accepted version invocation forms. */
    usage: Object.freeze(["version"]),
  }),
}) satisfies Readonly<Record<string, AsterCommandDescriptor>>;
