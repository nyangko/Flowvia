import React, { useState } from 'react';
import { Coords, AnchorPosition } from 'src/types';
import { useTheme, Box } from '@mui/material';
import { getIsoProjectionCss } from 'src/utils';
import { Svg } from 'src/components/Svg/Svg';
import { TRANSFORM_ANCHOR_SIZE, TRANSFORM_CONTROLS_COLOR } from 'src/config';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  position: Coords;
  anchorPosition: AnchorPosition;
  onMouseDown: () => void;
}

const strokeWidth = 2;

const RESIZE_CURSORS: Record<AnchorPosition, string> = {
  TOP_LEFT: 'nwse-resize',
  BOTTOM_RIGHT: 'nwse-resize',
  TOP_RIGHT: 'nesw-resize',
  BOTTOM_LEFT: 'nesw-resize'
};

export const TransformAnchor = ({ position, anchorPosition, onMouseDown }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const isFlat = useUiStateStore((state) => state.projectionMode === 'FLAT');

  return (
    <Box
      onMouseOver={() => {
        setIsHovered(true);
      }}
      onMouseOut={() => {
        setIsHovered(false);
      }}
      onMouseDown={onMouseDown}
      sx={{
        position: 'absolute',
        transform: getIsoProjectionCss(undefined, isFlat),
        width: TRANSFORM_ANCHOR_SIZE,
        height: TRANSFORM_ANCHOR_SIZE,
        cursor: RESIZE_CURSORS[anchorPosition]
      }}
      style={{
        left: position.x - TRANSFORM_ANCHOR_SIZE / 2,
        top: position.y - TRANSFORM_ANCHOR_SIZE / 2
      }}
    >
      <Svg
        style={{
          width: TRANSFORM_ANCHOR_SIZE,
          height: TRANSFORM_ANCHOR_SIZE
        }}
      >
        <g transform={`translate(${strokeWidth}, ${strokeWidth})`}>
          <rect
            fill={
              isHovered
                ? theme.palette.primary.dark
                : theme.palette.common.white
            }
            width={TRANSFORM_ANCHOR_SIZE - strokeWidth * 2}
            height={TRANSFORM_ANCHOR_SIZE - strokeWidth * 2}
            stroke={TRANSFORM_CONTROLS_COLOR}
            strokeWidth={strokeWidth}
            rx={3}
          />
        </g>
      </Svg>
    </Box>
  );
};
