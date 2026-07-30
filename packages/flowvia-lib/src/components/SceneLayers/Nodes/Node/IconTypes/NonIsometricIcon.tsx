import React from 'react';
import { Box } from '@mui/material';
import { Icon } from 'src/types';
import { PROJECTED_TILE_SIZE, UNPROJECTED_TILE_SIZE } from 'src/config';
import { getIsoProjectionCss } from 'src/utils';

interface Props {
  icon: Icon;
}

export const NonIsometricIcon = ({ icon }: Props) => {
  return (
    <Box sx={{ pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'absolute',
          // Calibrated against the user's DevTools-verified reference position
          // for a flat (non-isometric) icon — not derived from the projected
          // tile size like the isometric path above.
          left: -UNPROJECTED_TILE_SIZE / 2,
          top: 0,
          transformOrigin: 'top left',
          transform: getIsoProjectionCss()
        }}
      >
        <Box
          component="img"
          src={icon.url}
          alt={`icon-${icon.id}`}
          sx={{ width: PROJECTED_TILE_SIZE.width * 0.7 * (icon.scale || 0.7) }}
        />
      </Box>
    </Box>
  );
};
