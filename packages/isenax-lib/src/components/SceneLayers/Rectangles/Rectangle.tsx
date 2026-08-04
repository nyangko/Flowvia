import React, { memo } from 'react';
import { useScene } from 'src/hooks/useScene';
import { IsoTileArea } from 'src/components/IsoTileArea/IsoTileArea';
import { getColorVariant } from 'src/utils';
import { useColor } from 'src/hooks/useColor';
import { useUiStateStore } from 'src/stores/uiStateStore';

type Props = ReturnType<typeof useScene>['rectangles'][0];

export const Rectangle = memo(({ from, to, color: colorId, customColor }: Props) => {
  const predefinedColor = useColor(colorId);
  // Only hint "draggable" while idle in the default select tool AND actually
  // editable — read-only diagrams also sit in CURSOR mode now (so clicking
  // still opens the item's read-only panel), but nothing there responds to
  // a drag, so showing "move" would be misleading.
  const canDrag = useUiStateStore(
    (state) => state.mode.type === 'CURSOR' && state.editorMode === 'EDITABLE'
  );

  // Use custom color if provided, otherwise use predefined color
  const color = customColor 
    ? { value: customColor }
    : predefinedColor;

  if (!color) {
    return null;
  }

  return (
    <IsoTileArea
      from={from}
      to={to}
      fill={color.value}
      cornerRadius={22}
      stroke={{
        color: getColorVariant(color.value, 'dark', { grade: 2 }),
        width: 1
      }}
      cursor={canDrag ? 'move' : undefined}
    />
  );
});
