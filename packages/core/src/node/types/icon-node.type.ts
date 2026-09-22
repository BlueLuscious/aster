import type {
  IconCircleNode,
  IconEllipseNode,
  IconLineNode,
  IconPathNode,
  IconPolygonNode,
  IconPolylineNode,
  IconRectNode,
} from "../contracts/index.js";

/**
 * @description Closed discriminated union of portable geometry nodes.
 */
export type IconNodeType =
  | IconPathNode
  | IconCircleNode
  | IconEllipseNode
  | IconRectNode
  | IconLineNode
  | IconPolylineNode
  | IconPolygonNode;
