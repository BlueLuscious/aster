import type { iconDirections } from "../constants/icon-directions.constant.js";

/**
 * @description Explicit target-independent text direction accepted during rendering.
 */
export type IconDirectionType = (typeof iconDirections)[number];
