import { z } from 'zod';
import { coords, id, constrainedStrings } from './common';

export const connectorStyleOptions = ['SOLID', 'DOTTED', 'DASHED'] as const;
export const connectorLineTypeOptions = ['SINGLE', 'DOUBLE', 'DOUBLE_WITH_CIRCLE'] as const;

export const connectorLabelSchema = z.object({
  id,
  text: constrainedStrings.description,
  position: z.number().min(0).max(100), // Percentage along the path (0-100)
  height: z.number().optional(), // Vertical offset
  line: z.enum(['1', '2']).optional(), // Which line for double line types (defaults to '1')
  showLine: z.boolean().optional() // Show the dotted line connecting label to connector (defaults to true)
});

export const anchorSchema = z.object({
  id,
  ref: z
    .object({
      item: id,
      anchor: id,
      tile: coords
    })
    .partial()
});

export const connectorSchema = z.object({
  id,
  // Identity fields — purely for the author's own reference (shown in the
  // connector list/settings), distinct from `labels`, which render as visual
  // text on the canvas itself.
  name: constrainedStrings.name.optional(),
  notes: constrainedStrings.description.optional(),
  // Legacy label fields (for backward compatibility)
  description: constrainedStrings.description.optional(),
  startLabel: constrainedStrings.description.optional(),
  endLabel: constrainedStrings.description.optional(),
  startLabelHeight: z.number().optional(),
  centerLabelHeight: z.number().optional(),
  endLabelHeight: z.number().optional(),
  // New flexible labels array
  labels: z.array(connectorLabelSchema).max(256).optional(),
  color: id.optional(),
  customColor: z.string().optional(), // For custom RGB colors
  width: z.number().optional(),
  style: z.enum(connectorStyleOptions).optional(),
  lineType: z.enum(connectorLineTypeOptions).optional(),
  showArrow: z.boolean().optional(),
  // Whether this connector participates in group auto-spacing when it shares
  // both endpoints with other connectors (defaults to true). Set to false to
  // let it overlap its groupmates instead of being offset.
  preventOverlap: z.boolean().optional(),
  anchors: z.array(anchorSchema)
});
