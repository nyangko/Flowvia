import React from 'react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { RectangleTransformControls } from './RectangleTransformControls';
import { TextBoxTransformControls } from './TextBoxTransformControls';
import { NodeTransformControls } from './NodeTransformControls';

export const TransformControlsManager = () => {
  const itemControls = useUiStateStore((state) => {
    return state.itemControls;
  });
  const editorMode = useUiStateStore((state) => state.editorMode);

  // Resize handles are a mutating control (dragging one calls
  // scene.updateRectangle/etc.) — read-only diagrams can still select and
  // view an item, but shouldn't see handles that don't actually work.
  if (editorMode !== 'EDITABLE') return null;

  switch (itemControls?.type) {
    case 'ITEM':
      return <NodeTransformControls id={itemControls.id} />;
    case 'RECTANGLE':
      return <RectangleTransformControls id={itemControls.id} />;
    case 'TEXTBOX':
      return <TextBoxTransformControls id={itemControls.id} />;
    default:
      return null;
  }
};
