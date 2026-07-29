import type { iconPaintSchema } from "../constants/icon-paint-schema.constant.js";

/**
 * @description Closed portable paint accepted by icon presentation.
 * @remarks Literal colours use a canonical hexadecimal sRGB value validated at construction.
 */
export type IconPaintType =
  | (typeof iconPaintSchema.keywords)[number]
  | `#${string}`;
