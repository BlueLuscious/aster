import type { AsterCommandDescriptor } from "../contracts/index.js";
import { asterCommandNames } from "./aster-command-names.constant.js";

/**
 * @description Immutable host-neutral help metadata for every initial Aster command definition.
 */
export const asterCommandDescriptors = Object.freeze({
  export: Object.freeze({
    name: asterCommandNames.export,
    summary: "Export one icon or collection as deterministic SVG artefacts.",
    usage: Object.freeze([
      "export icon <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] [--label <text>] [--title <text>] [--output <root>]",
      "export collection <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] --output <root>",
      "export icon <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] [--label <text>] [--title <text>] --json",
      "export collection <identity> [--catalogue <provider>] [--size <number>] [--colour <paint>] [--fill <paint>] [--stroke <paint>] [--stroke-width <number>] [--direction <ltr|rtl>] --json",
    ]),
  }),
  list: Object.freeze({
    name: asterCommandNames.list,
    summary: "List catalogue providers, collections, or icons.",
    usage: Object.freeze([
      "list catalogues",
      "list collections [--catalogue <provider>]",
      "list icons [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...",
    ]),
  }),
  search: Object.freeze({
    name: asterCommandNames.search,
    summary: "Search icons and collections in explicit catalogues.",
    usage: Object.freeze([
      "search <query> [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...",
    ]),
  }),
  show: Object.freeze({
    name: asterCommandNames.show,
    summary: "Show one exact icon or collection.",
    usage: Object.freeze([
      "show icon <identity> [--catalogue <provider>]",
      "show collection <identity> [--catalogue <provider>]",
    ]),
  }),
  help: Object.freeze({
    name: asterCommandNames.help,
    summary: "Show accepted command help metadata.",
    usage: Object.freeze(["help", "help <command>"]),
  }),
  version: Object.freeze({
    name: asterCommandNames.version,
    summary: "Show explicit Aster product metadata.",
    usage: Object.freeze(["version"]),
  }),
}) satisfies Readonly<Record<string, AsterCommandDescriptor>>;
