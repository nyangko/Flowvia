import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';
import { Size } from 'src/types';
import gridTileSvg from 'src/assets/grid-tile-bg.svg';
import gridTileSvgFlat from 'src/assets/grid-tile-bg-flat.svg';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { PROJECTED_TILE_SIZE, FLAT_TILE_SIZE } from 'src/config';
import { SizeUtils } from 'src/utils/SizeUtils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';

export const Grid = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { size } = useResizeObserver(elementRef.current);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const scroll = useUiStateStore((state) => {
    return state.scroll;
  });
  const zoom = useUiStateStore((state) => {
    return state.zoom;
  });
  const isFlat = useUiStateStore((state) => {
    return state.projectionMode === 'FLAT';
  });

  useEffect(() => {
    if (!elementRef.current) return;

    const elSize = elementRef.current.getBoundingClientRect();

    if (isFlat) {
      const tileSize = SizeUtils.multiply(FLAT_TILE_SIZE, zoom);
      // getTilePosition centers tile (0,0) on the renderer's midpoint, so the
      // background pattern's cell boundaries (not corners) must line up with
      // that midpoint too — shift by half a tile so a cell's CENTER, not its
      // top-left corner, lands where icons are actually drawn.
      const backgroundPosition: Size = {
        width: elSize.width / 2 + scroll.position.x - tileSize.width / 2,
        height: elSize.height / 2 + scroll.position.y - tileSize.height / 2
      };

      gsap.to(elementRef.current, {
        duration: isFirstRender ? 0 : 0.016,
        ease: 'none',
        backgroundSize: `${tileSize.width}px ${tileSize.height}px`,
        backgroundPosition: `${backgroundPosition.width}px ${backgroundPosition.height}px`
      });
    } else {
      const tileSize = SizeUtils.multiply(PROJECTED_TILE_SIZE, zoom);
      const backgroundPosition: Size = {
        width: elSize.width / 2 + scroll.position.x + tileSize.width / 2,
        height: elSize.height / 2 + scroll.position.y
      };

      gsap.to(elementRef.current, {
        duration: isFirstRender ? 0 : 0.016, // ~1 frame at 60fps for smooth motion
        ease: 'none', // Linear easing for immediate response
        backgroundSize: `${tileSize.width}px ${tileSize.height * 2}px`,
        backgroundPosition: `${backgroundPosition.width}px ${backgroundPosition.height}px`
      });
    }

    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, [scroll, zoom, isFirstRender, size, isFlat]);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <Box
        ref={elementRef}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `repeat url("${isFlat ? gridTileSvgFlat : gridTileSvg}")`
        }}
      />
    </Box>
  );
};
