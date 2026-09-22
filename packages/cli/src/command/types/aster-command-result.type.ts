import type { AsterCommandDiagnosticType } from "./aster-command-diagnostic.type.js";
import type { AsterCommandNameType } from "./aster-command-name.type.js";
import type { AsterCommandPayloadType } from "./aster-command-payload.type.js";

/**
 * @description Immutable structured outcome returned by host-neutral command execution.
 * @typeParam Payload - Serialisable command-specific success payload.
 */
export type AsterCommandResultType<Payload extends object = AsterCommandPayloadType> =
  | Readonly<{
      /**
       * @description Discriminator for successful execution.
       */
      ok: true;

      /**
       * @description Command that produced the payload.
       */
      command: AsterCommandNameType;

      /**
       * @description Immutable command-specific serialisable value.
       */
      payload: Payload;
    }>
  | Readonly<{
      /**
       * @description Discriminator for expected or sanitised failed execution.
       */
      ok: false;

      /**
       * @description Requested command when one could be identified.
       */
      command?: AsterCommandNameType;

      /**
       * @description Stable evidence explaining the failure.
       */
      diagnostic: AsterCommandDiagnosticType;
    }>;
