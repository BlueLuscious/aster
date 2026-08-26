import type {
  IconDirectionType,
  IconPaintType,
} from "@aster/core";
import type { AsterExportSubjectType } from "../../export/types/index.js";
import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { TParsedExportCommandOptions } from "../types/internal/parsed-export-command-options.type.js";
import { CommandLineError } from "./command-line.error.js";

/**
 * @description Parses the closed standalone option family owned by SVG export.
 */
export class ExportCommandLineOptionParser {
  /**
   * @description Finite decimal grammar accepted before portable numeric validation.
   */
  readonly #numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu;

  /**
   * @description Parses singleton provider, render, accessibility, and output options.
   * @param tokens - Option tokens following the export subject and identity.
   * @param subject - Exact icon or collection export subject.
   * @returns Mutable accepted option values for invocation composition.
   */
  parse(
    tokens: readonly string[],
    subject: AsterExportSubjectType,
  ): TParsedExportCommandOptions {
    const parsed: TParsedExportCommandOptions = {};

    for (let index = 0; index < tokens.length; index += 2) {
      const option = tokens[index];
      const value = tokens[index + 1];

      if (option === undefined || !option.startsWith("--")) {
        throw new CommandLineError(
          `unexpected positional argument ${JSON.stringify(option)}`,
          commandLineTokens.commands.export,
        );
      }

      if (!this.#accepted(option, subject)) {
        throw new CommandLineError(
          `unknown option ${JSON.stringify(option)}`,
          commandLineTokens.commands.export,
        );
      }

      if (
        value === undefined
        || value.length === 0
        || value.startsWith("--")
      ) {
        throw new CommandLineError(
          `option ${option} requires a non-empty value`,
          commandLineTokens.commands.export,
        );
      }

      switch (option) {
        case commandLineTokens.options.catalogue:
          this.#set(parsed, "catalogue", value, option);
          break;
        case commandLineTokens.options.output:
          this.#set(parsed, "output", value, option);
          break;
        case commandLineTokens.options.size:
          this.#set(parsed, "size", this.#number(value, option), option);
          break;
        case commandLineTokens.options.strokeWidth:
          this.#set(
            parsed,
            "strokeWidth",
            this.#number(value, option),
            option,
          );
          break;
        case commandLineTokens.options.colour:
          this.#set(parsed, "colour", value as IconPaintType, option);
          break;
        case commandLineTokens.options.fill:
          this.#set(parsed, "fill", value as IconPaintType, option);
          break;
        case commandLineTokens.options.stroke:
          this.#set(parsed, "stroke", value as IconPaintType, option);
          break;
        case commandLineTokens.options.direction:
          this.#set(parsed, "direction", value as IconDirectionType, option);
          break;
        case commandLineTokens.options.label:
          this.#set(parsed, "label", value, option);
          break;
        case commandLineTokens.options.title:
          this.#set(parsed, "title", value, option);
          break;
        default:
          throw new CommandLineError(
            `unknown option ${JSON.stringify(option)}`,
            commandLineTokens.commands.export,
          );
      }
    }

    return parsed;
  }

  /**
   * @description Determines whether one option belongs to the selected export subject.
   * @param option - Candidate standalone option token.
   * @param subject - Exact icon or collection subject.
   * @returns Whether the option is accepted by that command form.
   */
  #accepted(option: string, subject: AsterExportSubjectType): boolean {
    return option === commandLineTokens.options.catalogue
      || option === commandLineTokens.options.output
      || option === commandLineTokens.options.size
      || option === commandLineTokens.options.colour
      || option === commandLineTokens.options.fill
      || option === commandLineTokens.options.stroke
      || option === commandLineTokens.options.strokeWidth
      || option === commandLineTokens.options.direction
      || (
        subject === commandLineTokens.subjects.icon
        && (
          option === commandLineTokens.options.label
          || option === commandLineTokens.options.title
        )
      );
  }

  /**
   * @description Assigns one accepted option field while enforcing singleton occurrence.
   * @param parsed - Mutable export option accumulator.
   * @param field - Exact field owned by the option.
   * @param value - Parsed value matching the selected field.
   * @param option - Accepted standalone option token.
   * @returns Nothing after assigning the field.
   * @typeParam Field - Exact mutable export-option field.
   */
  #set<Field extends keyof TParsedExportCommandOptions>(
    parsed: TParsedExportCommandOptions,
    field: Field,
    value: TParsedExportCommandOptions[Field],
    option: string,
  ): void {
    if (Object.hasOwn(parsed, field)) {
      throw new CommandLineError(
        `option ${option} cannot be repeated`,
        commandLineTokens.commands.export,
      );
    }

    parsed[field] = value;
  }

  /**
   * @description Parses one finite decimal token without applying its portable value domain.
   * @param value - Candidate textual number.
   * @param option - Option owning the numeric token.
   * @returns Finite JavaScript number delegated to command validation.
   */
  #number(value: string, option: string): number {
    const parsed = Number(value);

    if (!this.#numberPattern.test(value) || !Number.isFinite(parsed)) {
      throw new CommandLineError(
        `option ${option} requires a finite decimal number`,
        commandLineTokens.commands.export,
      );
    }

    return parsed;
  }
}
