/**
 * @description Immutable parameter-group arity for every accepted SVG path command.
 */
export const svgPathCommandParameterCounts = Object.freeze({
  a: 7,
  c: 6,
  h: 1,
  l: 2,
  m: 2,
  q: 4,
  s: 4,
  t: 2,
  v: 1,
  z: 0,
}) satisfies Readonly<Record<string, number>>;
