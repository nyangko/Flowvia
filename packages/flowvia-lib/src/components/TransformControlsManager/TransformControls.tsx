import React, { useMemo } from 'react';
import { Coords, AnchorPosition } from 'src/types';
import { Svg } from 'src/components/Svg/Svg';
import { TRANSFORM_CONTROLS_COLOR } from 'src/config';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import {
  getBoundingBox,
  outermostCornerPositions,
  getTilePosition,
  convertBoundsToNamedAnchors
} from 'src/utils';
import { TransformAnchor } from './TransformAnchor';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  from: Coords;
  to: Coords;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const strokeWidth = 2;

export const TransformControls = ({ from, to, onAnchorMouseDown }: Props) => {
  const isFlat = useUiStateStore((state) => state.projectionMode === 'FLAT');
  const { css, pxSize, position: flatTopLeft } = useIsoProjection({
    from,
    to
  });

  const anchors = useMemo(() => {
    if (!onAnchorMouseDown) return [];

    // getTilePosition's named-corner origins (outermostCornerPositions) only
    // ever offset a single axis, which is correct for the skewed iso diamond
    // but not for a flat, unrotated rectangle — a real corner there needs
    // both axes offset at once. useIsoProjection already computes that true
    // top-left corner for the body itself, so derive all 4 corners from it
    // directly instead, guaranteeing they land exactly on the body's edges.
    if (isFlat) {
      const flatCorners: Record<AnchorPosition, Coords> = {
        TOP_LEFT: flatTopLeft,
        TOP_RIGHT: { x: flatTopLeft.x + pxSize.width, y: flatTopLeft.y },
        BOTTOM_RIGHT: {
          x: flatTopLeft.x + pxSize.width,
          y: flatTopLeft.y + pxSize.height
        },
        BOTTOM_LEFT: { x: flatTopLeft.x, y: flatTopLeft.y + pxSize.height }
      };

      return (Object.keys(flatCorners) as AnchorPosition[]).map((key) => ({
        position: flatCorners[key],
        anchorPosition: key,
        onMouseDown: () => {
          onAnchorMouseDown(key);
        }
      }));
    }

    const corners = getBoundingBox([from, to]);
    const namedCorners = convertBoundsToNamedAnchors(corners);
    const cornerPositions = Object.entries(namedCorners).map(
      ([key, value], i) => {
        const position = getTilePosition({
          tile: value,
          origin: outermostCornerPositions[i]
        });

        return {
          position,
          anchorPosition: key as AnchorPosition,
          onMouseDown: () => {
            onAnchorMouseDown(key as AnchorPosition);
          }
        };
      }
    );

    return cornerPositions;
  }, [onAnchorMouseDown, from, to, isFlat, flatTopLeft, pxSize]);

  return (
    <>
      <Svg
        style={{
          ...css,
          pointerEvents: 'none'
        }}
      >
        <g transform={`translate(${strokeWidth}, ${strokeWidth})`}>
          <rect
            width={pxSize.width - strokeWidth * 2}
            height={pxSize.height - strokeWidth * 2}
            fill="none"
            stroke={TRANSFORM_CONTROLS_COLOR}
            strokeDasharray={`${strokeWidth * 2} ${strokeWidth * 2}`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      </Svg>

      {anchors.map(({ position, anchorPosition, onMouseDown }) => {
        return (
          <TransformAnchor
            key={anchorPosition}
            position={position}
            anchorPosition={anchorPosition}
            onMouseDown={onMouseDown}
          />
        );
      })}
    </>
  );
};
