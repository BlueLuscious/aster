/**
 * @description Exact finite XML declaration grammar accepted before an SVG root.
 */
export const xmlDeclarationPattern =
  /^<\?xml\s+version=["']1\.0["'](?:\s+encoding=["']utf-8["'])?(?:\s+standalone=["'](?:yes|no)["'])?\s*\?>$/iu;
