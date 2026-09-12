import {
  iconPathCommandKinds,
  type IconPathCommandType,
} from "@aster/core";
import type { TSvgPathNormalisationState } from "../types/internal/svg-path-normalisation-state.type.js";
import type { TSvgPathSegment } from "../../shared/types/internal/svg-path-segment.type.js";
import { svgPathCommands } from "../../shared/constants/svg-path-commands.constant.js";
import { SvgImportError } from "../../shared/runtime/svg-import.error.js";
import { SvgPathDataInspector } from "../../shared/runtime/svg-path-data.inspector.js";

/**
 * @description Translates accepted SVG path syntax into canonical absolute portable commands.
 */
export class SvgPathDataNormaliser {
  /**
   * @description Accepted SVG path grammar and source-segment authority.
   */
  readonly #inspector = new SvgPathDataInspector();

  /**
   * @description Normalises one previously validated SVG path value.
   * @param value - Exact accepted authored path data.
   * @returns Frozen canonical portable command sequence.
   */
  normalise(value: string): readonly IconPathCommandType[] {
    const inspection = this.#inspector.inspect(value);

    if (
      !inspection.valid ||
      !inspection.hasDrawingOperation ||
      inspection.segments === undefined
    ) {
      throw new SvgImportError(
        "validatedPath",
        "path data is not valid normalisation input",
      );
    }

    const state: TSvgPathNormalisationState = {
      currentX: 0,
      currentY: 0,
      contourStartX: 0,
      contourStartY: 0,
    };
    const commands: IconPathCommandType[] = [];

    for (const segment of inspection.segments) {
      this.#normaliseSegment(segment, state, commands);
    }

    return Object.freeze(commands);
  }

  /**
   * @description Expands one source segment into one or more canonical portable commands.
   * @param segment - Accepted SVG segment retaining authored command casing.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseSegment(
    segment: TSvgPathSegment,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    const relative =
      segment.authoredCommand === segment.authoredCommand.toLowerCase();

    switch (segment.command) {
      case svgPathCommands.move:
        this.#normaliseMove(segment.values, relative, state, commands);
        break;
      case svgPathCommands.line:
        this.#normaliseLine(segment.values, relative, state, commands);
        break;
      case svgPathCommands.horizontalLine:
        this.#normaliseHorizontalLine(segment.values, relative, state, commands);
        break;
      case svgPathCommands.verticalLine:
        this.#normaliseVerticalLine(segment.values, relative, state, commands);
        break;
      case svgPathCommands.cubicBezier:
        this.#normaliseCubic(segment.values, relative, state, commands);
        break;
      case svgPathCommands.smoothCubicBezier:
        this.#normaliseSmoothCubic(segment.values, relative, state, commands);
        break;
      case svgPathCommands.quadraticBezier:
        this.#normaliseQuadratic(segment.values, relative, state, commands);
        break;
      case svgPathCommands.smoothQuadraticBezier:
        this.#normaliseSmoothQuadratic(segment.values, relative, state, commands);
        break;
      case svgPathCommands.arc:
        this.#normaliseArc(segment.values, relative, state, commands);
        break;
      case svgPathCommands.close:
        commands.push(Object.freeze({ kind: iconPathCommandKinds.close }));
        state.currentX = state.contourStartX;
        state.currentY = state.contourStartY;
        this.#resetControls(state);
        break;
    }
  }

  /**
   * @description Expands move groups, treating subsequent pairs as straight lines.
   * @param values - Complete move parameter groups.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseMove(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 2) {
      const x = this.#absolute(values[index] ?? 0, state.currentX, relative);
      const y = this.#absolute(values[index + 1] ?? 0, state.currentY, relative);
      const first = index === 0;

      commands.push(Object.freeze({
        kind: first ? iconPathCommandKinds.move : iconPathCommandKinds.line,
        x,
        y,
      }));
      state.currentX = x;
      state.currentY = y;

      if (first) {
        state.contourStartX = x;
        state.contourStartY = y;
      }

      this.#resetControls(state);
    }
  }

  /**
   * @description Expands straight line groups into absolute endpoints.
   * @param values - Complete line parameter groups.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseLine(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 2) {
      const x = this.#absolute(values[index] ?? 0, state.currentX, relative);
      const y = this.#absolute(values[index + 1] ?? 0, state.currentY, relative);

      commands.push(Object.freeze({ kind: iconPathCommandKinds.line, x, y }));
      state.currentX = x;
      state.currentY = y;
      this.#resetControls(state);
    }
  }

  /**
   * @description Expands horizontal values into absolute straight endpoints.
   * @param values - Horizontal endpoint values.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseHorizontalLine(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (const value of values) {
      const x = this.#absolute(value, state.currentX, relative);
      commands.push(Object.freeze({
        kind: iconPathCommandKinds.line,
        x,
        y: state.currentY,
      }));
      state.currentX = x;
      this.#resetControls(state);
    }
  }

  /**
   * @description Expands vertical values into absolute straight endpoints.
   * @param values - Vertical endpoint values.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseVerticalLine(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (const value of values) {
      const y = this.#absolute(value, state.currentY, relative);
      commands.push(Object.freeze({
        kind: iconPathCommandKinds.line,
        x: state.currentX,
        y,
      }));
      state.currentY = y;
      this.#resetControls(state);
    }
  }

  /**
   * @description Expands cubic groups into absolute endpoints and controls.
   * @param values - Complete cubic parameter groups.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseCubic(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 6) {
      const originX = state.currentX;
      const originY = state.currentY;
      const control1X = this.#absolute(values[index] ?? 0, originX, relative);
      const control1Y = this.#absolute(values[index + 1] ?? 0, originY, relative);
      const control2X = this.#absolute(values[index + 2] ?? 0, originX, relative);
      const control2Y = this.#absolute(values[index + 3] ?? 0, originY, relative);
      const x = this.#absolute(values[index + 4] ?? 0, originX, relative);
      const y = this.#absolute(values[index + 5] ?? 0, originY, relative);

      commands.push(Object.freeze({
        kind: iconPathCommandKinds.cubicBezier,
        control1X,
        control1Y,
        control2X,
        control2Y,
        x,
        y,
      }));
      state.currentX = x;
      state.currentY = y;
      state.cubicControlX = control2X;
      state.cubicControlY = control2Y;
      this.#resetQuadraticControl(state);
    }
  }

  /**
   * @description Expands smooth cubic groups by reflecting eligible previous controls.
   * @param values - Complete smooth cubic parameter groups.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseSmoothCubic(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 4) {
      const originX = state.currentX;
      const originY = state.currentY;
      const control1X = this.#reflect(state.cubicControlX, originX);
      const control1Y = this.#reflect(state.cubicControlY, originY);
      const control2X = this.#absolute(values[index] ?? 0, originX, relative);
      const control2Y = this.#absolute(values[index + 1] ?? 0, originY, relative);
      const x = this.#absolute(values[index + 2] ?? 0, originX, relative);
      const y = this.#absolute(values[index + 3] ?? 0, originY, relative);

      commands.push(Object.freeze({
        kind: iconPathCommandKinds.cubicBezier,
        control1X,
        control1Y,
        control2X,
        control2Y,
        x,
        y,
      }));
      state.currentX = x;
      state.currentY = y;
      state.cubicControlX = control2X;
      state.cubicControlY = control2Y;
      this.#resetQuadraticControl(state);
    }
  }

  /**
   * @description Expands quadratic groups into absolute endpoints and controls.
   * @param values - Complete quadratic parameter groups.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseQuadratic(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 4) {
      const originX = state.currentX;
      const originY = state.currentY;
      const controlX = this.#absolute(values[index] ?? 0, originX, relative);
      const controlY = this.#absolute(values[index + 1] ?? 0, originY, relative);
      const x = this.#absolute(values[index + 2] ?? 0, originX, relative);
      const y = this.#absolute(values[index + 3] ?? 0, originY, relative);

      commands.push(Object.freeze({
        kind: iconPathCommandKinds.quadraticBezier,
        controlX,
        controlY,
        x,
        y,
      }));
      state.currentX = x;
      state.currentY = y;
      state.quadraticControlX = controlX;
      state.quadraticControlY = controlY;
      this.#resetCubicControl(state);
    }
  }

  /**
   * @description Expands smooth quadratic groups by reflecting eligible previous controls.
   * @param values - Complete smooth quadratic endpoint groups.
   * @param relative - Whether coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseSmoothQuadratic(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 2) {
      const originX = state.currentX;
      const originY = state.currentY;
      const controlX = this.#reflect(state.quadraticControlX, originX);
      const controlY = this.#reflect(state.quadraticControlY, originY);
      const x = this.#absolute(values[index] ?? 0, originX, relative);
      const y = this.#absolute(values[index + 1] ?? 0, originY, relative);

      commands.push(Object.freeze({
        kind: iconPathCommandKinds.quadraticBezier,
        controlX,
        controlY,
        x,
        y,
      }));
      state.currentX = x;
      state.currentY = y;
      state.quadraticControlX = controlX;
      state.quadraticControlY = controlY;
      this.#resetCubicControl(state);
    }
  }

  /**
   * @description Expands arc groups into absolute endpoints and semantic flags.
   * @param values - Complete arc parameter groups.
   * @param relative - Whether endpoint coordinates are relative to the current point.
   * @param state - Mutable absolute traversal state.
   * @param commands - Canonical command output under construction.
   * @returns Nothing.
   */
  #normaliseArc(
    values: readonly number[],
    relative: boolean,
    state: TSvgPathNormalisationState,
    commands: IconPathCommandType[],
  ): void {
    for (let index = 0; index < values.length; index += 7) {
      const originX = state.currentX;
      const originY = state.currentY;
      const x = this.#absolute(values[index + 5] ?? 0, originX, relative);
      const y = this.#absolute(values[index + 6] ?? 0, originY, relative);

      commands.push(Object.freeze({
        kind: iconPathCommandKinds.arc,
        radiusX: values[index] ?? 0,
        radiusY: values[index + 1] ?? 0,
        rotation: values[index + 2] ?? 0,
        largeArc: values[index + 3] === 1,
        sweep: values[index + 4] === 1,
        x,
        y,
      }));
      state.currentX = x;
      state.currentY = y;
      this.#resetControls(state);
    }
  }

  /**
   * @description Resolves one source coordinate against the current absolute axis position.
   * @param value - Canonical source coordinate.
   * @param current - Current absolute axis position.
   * @param relative - Whether the source coordinate is relative.
   * @returns Canonical absolute coordinate.
   */
  #absolute(value: number, current: number, relative: boolean): number {
    const absolute = relative ? current + value : value;
    return Object.is(absolute, -0) ? 0 : absolute;
  }

  /**
   * @description Reflects an eligible previous control around the current axis position.
   * @param control - Previous control axis position when eligible.
   * @param current - Current absolute axis position.
   * @returns Reflected or coincident canonical control coordinate.
   */
  #reflect(control: number | undefined, current: number): number {
    const reflected = control === undefined ? current : 2 * current - control;
    return Object.is(reflected, -0) ? 0 : reflected;
  }

  /**
   * @description Clears both shorthand-control families after an unrelated operation.
   * @param state - Mutable absolute traversal state.
   * @returns Nothing.
   */
  #resetControls(state: TSvgPathNormalisationState): void {
    this.#resetCubicControl(state);
    this.#resetQuadraticControl(state);
  }

  /**
   * @description Clears the previous cubic control from traversal state.
   * @param state - Mutable absolute traversal state.
   * @returns Nothing.
   */
  #resetCubicControl(state: TSvgPathNormalisationState): void {
    delete state.cubicControlX;
    delete state.cubicControlY;
  }

  /**
   * @description Clears the previous quadratic control from traversal state.
   * @param state - Mutable absolute traversal state.
   * @returns Nothing.
   */
  #resetQuadraticControl(state: TSvgPathNormalisationState): void {
    delete state.quadraticControlX;
    delete state.quadraticControlY;
  }
}
