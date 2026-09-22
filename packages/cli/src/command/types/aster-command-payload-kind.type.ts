import type { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";

/**
 * @description Stable discriminator of one initial structured command payload.
 */
export type AsterCommandPayloadKindType =
  (typeof asterCommandPayloadKinds)[keyof typeof asterCommandPayloadKinds];
