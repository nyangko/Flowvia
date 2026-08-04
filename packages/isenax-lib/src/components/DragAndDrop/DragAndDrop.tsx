import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { Coords } from 'src/types';
import { getTilePosition, findNearestUnoccupiedTile } from 'src/utils';
import { useIcon } from 'src/hooks/useIcon';
import { useScene } from 'src/hooks/useScene';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  iconId: string;
  tile: Coords;
}

export const DragAndDrop = ({ iconId, tile }: Props) => {
  const { iconComponent } = useIcon(iconId);
  const scene = useScene();
  const isFlat = useUiStateStore((state) => state.projectionMode === 'FLAT');

  // PlaceIcon.mouseup redirects onto the nearest unoccupied tile when the
  // hovered tile is already taken (src/interaction/modes/PlaceIcon.ts) — mirror
  // that here so the preview shows where the icon will actually land, not the
  // raw hovered tile it'll get bumped away from.
  const targetTile = useMemo(() => {
    return findNearestUnoccupiedTile(tile, scene) ?? tile;
  }, [tile, scene]);

  // Node.tsx anchors placed items at the tile's CENTER (it requests 'BOTTOM' but
  // then subtracts the same half-tile-height back out for its content box, which
  // cancels to CENTER). This preview must match that anchor, or it renders offset
  // from where the item actually lands once placed.
  const tilePosition = useMemo(() => {
    return getTilePosition({ tile: targetTile, origin: 'CENTER', flat: isFlat });
  }, [targetTile, isFlat]);

  return (
    <Box
      sx={{
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      style={{ left: tilePosition.x, top: tilePosition.y }}
    >
      {/* IsometricIcon's <img> is position:absolute with no left/top, so its
          rendered spot depends on the CSS static-position fallback of its
          container — which differs between a plain block box and a flex-
          centered one. Node.tsx wraps icons in this same nested-flex shape;
          mirroring it here (rather than block) is what keeps this preview's
          position matching where the icon actually lands once placed. */}
      <Box
        sx={{
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {iconComponent}
      </Box>
    </Box>
  );
};
