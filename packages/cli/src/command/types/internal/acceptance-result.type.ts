import type { AsterCommandDiagnosticType } from "../aster-command-diagnostic.type.js";

/**
 * @description Internal accepted value or structured rejection produced by boundary normalisation.
 * @typeParam Value - Canonical immutable value returned after acceptance.
 */
export type TAcceptanceResult<Value> =
  | Readonly<{
      /**
       * @description Discriminator for accepted boundary input.
       */
      accepted: true;

      /**
       * @description Canonical immutable accepted value.
       */
      value: Value;
    }>
  | Readonly<{
      /**
       * @description Discriminator for rejected boundary input.
       */
      accepted: false;

      /**
       * @description Stable structured reason for rejection.
       */
      diagnostic: AsterCommandDiagnosticType;
    }>;
