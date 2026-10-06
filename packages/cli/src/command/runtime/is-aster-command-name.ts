import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { AsterCommandNameType } from "../types/aster-command-name.type.js";

/**
 * @description Recognises one command name from the immutable built-in vocabulary.
 * @param value - Candidate command identity.
 * @returns Whether the value identifies an accepted Aster command.
 */
export function isAsterCommandName(value: unknown): value is AsterCommandNameType {
  return typeof value === "string"
    && Object.values(asterCommandNames).some((name) => name === value);
}
