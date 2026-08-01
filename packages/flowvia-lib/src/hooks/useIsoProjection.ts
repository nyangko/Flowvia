import { useMemo } from 'react';
import { Coords, Size, ProjectionOrientationEnum } from 'src/types';
import {
  getBoundingBox,
  getIsoProjectionCss,
  getTilePosition
} from 'src/utils';
import { UNPROJECTED_TILE_SIZE, FLAT_TILE_SIZE } from 'src/config';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  from: Coords;
  to: Coords;
  originOverride?: Coords;
  orientation?: keyof typeof ProjectionOrientationEnum;
}

export const useIsoProjection = ({
  from,
  to,
  originOverride,
  orientation
}: Props): {
  css: React.CSSProperties;
  position: Coords;
  gridSize: Size;
  pxSize: Size;
} => {
  const isFlat = useUiStateStore((state) => {
    return state.projectionMode === 'FLAT';
  });

  const gridSize = useMemo(() => {
    return {
      width: Math.abs(from.x - to.x) + 1,
      height: Math.abs(from.y - to.y) + 1
    };
  }, [from, to]);

  const origin = useMemo(() => {
    if (originOverride) return originOverride;

    const boundingBox = getBoundingBox([from, to]);

    return boundingBox[3];
  }, [from, to, originOverride]);

  const position = useMemo(() => {
    if (isFlat) {
      // The isometric "origin" corner (lowX/highY) plus a single-axis LEFT/TOP
      // offset only works with the diamond math + skew below — flat content
      // isn't skewed, so it needs its own true top-left screen corner instead:
      // smallest x (screen x grows with tile.x) but LARGEST y, since flat's
      // tile.y is negated in getTilePosition so screen y shrinks as tile.y grows.
      const topLeftTile = {
        x: Math.min(from.x, to.x),
        y: Math.max(from.y, to.y)
      };
      const center = getTilePosition({ tile: topLeftTile, origin: 'CENTER', flat: true });

      return {
        x: center.x - FLAT_TILE_SIZE.width / 2,
        y: center.y - FLAT_TILE_SIZE.height / 2
      };
    }

    return getTilePosition({
      tile: origin,
      origin: orientation === 'Y' ? 'TOP' : 'LEFT'
    });
  }, [origin, orientation, isFlat, from, to]);

  const pxSize = useMemo(() => {
    return {
      width: gridSize.width * UNPROJECTED_TILE_SIZE,
      height: gridSize.height * UNPROJECTED_TILE_SIZE
    };
  }, [gridSize]);

  return useMemo(() => ({
    css: {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
      width: `${pxSize.width}px`,
      height: `${pxSize.height}px`,
      transform: getIsoProjectionCss(orientation, isFlat),
      transformOrigin: 'top left'
    },
    position,
    gridSize,
    pxSize
  }), [position, pxSize, gridSize, orientation, isFlat]);
};
