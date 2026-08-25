import type { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { AsterCommandListSubjectType } from "./aster-command-list-subject.type.js";
import type { AsterCommandNameType } from "./aster-command-name.type.js";
import type { AsterCommandShowSubjectType } from "./aster-command-show-subject.type.js";
import type {
  AsterExportOptionsType,
  AsterIconExportOptionsType,
} from "../../export/types/index.js";

/**
 * @description Closed structured invocation accepted by the initial Aster command set.
 */
export type AsterCommandInvocationType =
  | Readonly<{
      /**
       * @description Selects deterministic SVG export planning.
       */
      command: typeof asterCommandNames.export;

      /**
       * @description Selects one exact icon definition.
       */
      subject: "icon";

      /**
       * @description Canonical textual icon identity to export.
       */
      identity: string;

      /**
       * @description Optional exact catalogue-provider filter.
       */
      catalogue?: string;

      /**
       * @description Optional portable icon-specific render values.
       */
      options?: AsterIconExportOptionsType;
    }>
  | Readonly<{
      /**
       * @description Selects deterministic SVG export planning.
       */
      command: typeof asterCommandNames.export;

      /**
       * @description Selects one exact collection definition.
       */
      subject: "collection";

      /**
       * @description Canonical textual collection identity to export.
       */
      identity: string;

      /**
       * @description Optional exact catalogue-provider filter.
       */
      catalogue?: string;

      /**
       * @description Optional portable values applied uniformly to every member.
       */
      options?: AsterExportOptionsType;
    }>
  | Readonly<{
      /**
       * @description Selects deterministic catalogue listing.
       */
      command: typeof asterCommandNames.list;

      /**
       * @description Kind of catalogue value to list.
       */
      subject: AsterCommandListSubjectType;

      /**
       * @description Optional exact catalogue-provider filter.
       */
      catalogue?: string;

      /**
       * @description Optional exact collection-identity filter for icon listing.
       */
      collection?: string;

      /**
       * @description Optional unique canonical tags required from listed icons.
       */
      tags?: readonly string[];
    }>
  | Readonly<{
      /**
       * @description Selects deterministic catalogue search.
       */
      command: typeof asterCommandNames.search;

      /**
       * @description Non-empty case-insensitive query matched by all terms.
       */
      query: string;

      /**
       * @description Optional exact catalogue-provider filter.
       */
      catalogue?: string;

      /**
       * @description Optional exact collection-identity filter.
       */
      collection?: string;

      /**
       * @description Optional unique canonical tags required from matched icons.
       */
      tags?: readonly string[];
    }>
  | Readonly<{
      /**
       * @description Selects one exact catalogue subject.
       */
      command: typeof asterCommandNames.show;

      /**
       * @description Kind of portable identity to resolve.
       */
      subject: AsterCommandShowSubjectType;

      /**
       * @description Canonical textual portable identity to resolve.
       */
      identity: string;

      /**
       * @description Optional exact catalogue-provider filter.
       */
      catalogue?: string;
    }>
  | Readonly<{
      /**
       * @description Selects deterministic command help metadata.
       */
      command: typeof asterCommandNames.help;

      /**
       * @description Optional command whose accepted usage should be described.
       */
      commandName?: AsterCommandNameType;
    }>
  | Readonly<{
      /**
       * @description Selects explicit product version metadata.
       */
      command: typeof asterCommandNames.version;
    }>;
