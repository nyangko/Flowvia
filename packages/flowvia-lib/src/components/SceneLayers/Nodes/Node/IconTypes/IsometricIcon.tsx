import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { PROJECTED_TILE_SIZE } from 'src/config';
import { useResizeObserver } from 'src/hooks/useResizeObserver';

interface Props {
  url: string;
  name?: string;
  scale?: number;
  onImageLoaded?: () => void;
}

interface ContentOffset {
  // Horizontal: how far the content's centroid sits from the image's own
  // horizontal center, as a fraction of width.
  xRatio: number;
  aspectRatio: number;
}

const NO_OFFSET: ContentOffset = { xRatio: 0, aspectRatio: 1 };

// A hard alpha cutoff (rather than every non-transparent pixel) so a soft drop
// shadow baked into the same image at partial opacity doesn't get counted as
// part of the standing object.
const CONTENT_ALPHA_THRESHOLD = 128;

// Vertical anchor: fixed fraction of image height to shift the anchor down
// from center. Isometric art stands on its tile — anchoring by raw content
// center made tall/lopsided icons look like they'd sunk into the floor.
// Reverse-engineering the user's hand-placed reference icons found this
// clusters tightly (mean ~0.20, stdev ~0.05) regardless of image shape... for
// most icons. Cube-shaped icons (a box viewed in iso projection has its mass
// already balanced on the tile) are the exception and need almost no shift.
const CONTENT_ANCHOR_Y_RATIO = 0.2;
const CUBE_ANCHOR_Y_RATIO = 0.03;
const CUBE_SHAPED_ICON_NAMES = new Set(['block', 'server', 'switch-module', 'vm', 'cube']);

// Icon art (e.g. a lightning bolt) rarely fills its own canvas symmetrically, so
// anchoring the tile on the image's raw bounding box still looks off. This scans
// the loaded image once per URL to find where the visible content actually sits,
// so we can shift the image to center it horizontally and plant its base vertically.
const contentOffsetCache = new Map<string, ContentOffset>();

const computeContentOffset = (img: HTMLImageElement): ContentOffset => {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return NO_OFFSET;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return NO_OFFSET;

  try {
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, w, h);

    let minX = w;
    let maxX = 0;
    let minY = h;
    let maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > CONTENT_ALPHA_THRESHOLD) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) return NO_OFFSET;

    const contentCenterX = (minX + maxX) / 2;

    return {
      xRatio: (contentCenterX - w / 2) / w,
      aspectRatio: h / w
    };
  } catch {
    // Cross-origin images taint the canvas and throw on getImageData; render unshifted.
    return NO_OFFSET;
  }
};

export const IsometricIcon = ({ url, name, scale = 1, onImageLoaded }: Props) => {
  const ref = useRef<HTMLImageElement>(null);
  const { observe, disconnect } = useResizeObserver();
  const [contentOffset, setContentOffset] = useState<ContentOffset>(() => {
    return contentOffsetCache.get(url) ?? NO_OFFSET;
  });

  useEffect(() => {
    if (!ref.current) return;

    observe(ref.current);

    return disconnect;
  }, [observe, disconnect]);

  useEffect(() => {
    setContentOffset(contentOffsetCache.get(url) ?? NO_OFFSET);
  }, [url]);

  const handleLoad = () => {
    if (ref.current) {
      let offset = contentOffsetCache.get(url);
      if (!offset) {
        offset = computeContentOffset(ref.current);
        contentOffsetCache.set(url, offset);
      }
      setContentOffset(offset);
    }
    onImageLoaded?.();
  };

  const renderedWidth = PROJECTED_TILE_SIZE.width * 0.8 * scale;
  const renderedHeight = renderedWidth * contentOffset.aspectRatio;
  const yRatio = name && CUBE_SHAPED_ICON_NAMES.has(name) ? CUBE_ANCHOR_Y_RATIO : CONTENT_ANCHOR_Y_RATIO;

  return (
    <Box
      ref={ref}
      component="img"
      onLoad={handleLoad}
      src={url}
      sx={{
        position: 'absolute',
        width: renderedWidth,
        pointerEvents: 'none'
      }}
      style={{
        transform: `translate(${-contentOffset.xRatio * renderedWidth}px, ${-yRatio * renderedHeight}px)`
      }}
    />
  );
};
