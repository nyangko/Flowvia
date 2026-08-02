import type { Connector } from 'src/types';
import { UNPROJECTED_TILE_SIZE, CONNECTOR_DEFAULTS } from 'src/config';

function getAnchorRefString(ref: Connector['anchors'][0]['ref']): string {
  if (ref.item !== undefined) {
    return ref.item;
  }
  if (ref.tile !== undefined) {
    return `tile:${ref.tile.x},${ref.tile.y}`;
  }
  if (ref.anchor !== undefined) {
    return `anchor:${ref.anchor}`;
  }
  return JSON.stringify(ref);
}

/**
 * Group connectors that share the same pair of anchor references.
 * Returns a Map where each connector ID maps to its index within its group
 * and the total group size.
 */
export function getConnectorGroups(
  connectors: Connector[]
): Map<string, { index: number; total: number; reversed: boolean; groupWidthRatio: number }> {
  const groups = new Map<string, { id: string; reversed: boolean; width: number }[]>();

  for (const connector of connectors) {
    if (connector.anchors.length !== 2) {
      continue;
    }
    // Connectors that opt out of auto-spacing are left out of every group
    // entirely, so they always render at their raw (un-offset) position and
    // don't shift where their groupmates land.
    if (connector.preventOverlap === false) {
      continue;
    }

    const ref1 = getAnchorRefString(connector.anchors[0].ref);
    const ref2 = getAnchorRefString(connector.anchors[1].ref);
    const sorted = [ref1, ref2].sort();
    const key = sorted.join('|');
    // Anchor order (which endpoint was drawn first) differs per connector even
    // within the same group; normalize against the group's canonical (sorted)
    // order so perpendicular offsets below are all computed relative to the
    // same direction instead of each connector's own draw direction.
    const reversed = ref1 !== sorted[0];
    const width = connector.width ?? CONNECTOR_DEFAULTS.width;

    const existing = groups.get(key);
    if (existing) {
      existing.push({ id: connector.id, reversed, width });
    } else {
      groups.set(key, [{ id: connector.id, reversed, width }]);
    }
  }

  const result = new Map<
    string,
    { index: number; total: number; reversed: boolean; groupWidthRatio: number }
  >();

  for (const entries of groups.values()) {
    const total = entries.length;
    // Fraction of a tile the group's connectors would occupy side by side —
    // used by getGroupOffset to widen spacing when the group is thick, so a
    // fatter connector doesn't visually overlap its thinner groupmates.
    const groupWidthRatio =
      entries.reduce((sum, entry) => sum + entry.width, 0) / UNPROJECTED_TILE_SIZE;
    entries.forEach(({ id, reversed }, index) => {
      result.set(id, { index, total, reversed, groupWidthRatio });
    });
  }

  return result;
}

/**
 * Calculate the perpendicular pixel offset for a connector within a group.
 * Connectors in a group normally fit within a single tile, but if the
 * group's combined width (groupWidthRatio) exceeds the default 80% budget,
 * spacing widens to match — otherwise a thick connector can visually
 * overlap thinner groupmates even though each has its own "slot".
 *
 * @param index - Position of the connector within its group (0-based)
 * @param total - Total number of connectors in the group
 * @param tileSize - Size of one tile in pixels (connectors must fit within this)
 * @param groupWidthRatio - Combined connector width as a fraction of one tile
 *   (from getConnectorGroups); omit or pass 0 to keep the original fixed 80% spacing.
 * @returns Pixel offset to apply perpendicular to the connector path
 */
export function getGroupOffset(
  index: number,
  total: number,
  tileSize: number,
  groupWidthRatio: number = 0
): number {
  if (total <= 1) {
    return 0;
  }

  // Use 80% of tile to leave padding at edges, unless the group's connectors
  // are collectively thicker than that, in which case widen to fit them.
  const usableWidth = tileSize * Math.max(0.8, groupWidthRatio * 1.5);
  const spacing = usableWidth / (total - 1);

  return (index - (total - 1) / 2) * spacing;
}
