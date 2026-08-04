export interface PanSettings {
  // Mouse pan options
  middleClickPan: boolean;
  rightClickPan: boolean;
  ctrlClickPan: boolean;
  altClickPan: boolean;
  emptyAreaClickPan: boolean;
  holdToPan: boolean;

  // Keyboard pan options
  arrowKeysPan: boolean;
  wasdPan: boolean;
  ijklPan: boolean;
  
  // Pan speed
  keyboardPanSpeed: number;
}

export const DEFAULT_PAN_SETTINGS: PanSettings = {
  // Mouse options - start with common defaults
  middleClickPan: true,
  rightClickPan: false,
  ctrlClickPan: false,
  altClickPan: false,
  // Superseded by holdToPan below as the default empty-area behavior — this
  // instant (no-delay) trigger always wins over the 0.3s hold, so it's now
  // opt-in for users who want the old immediate click-drag-to-pan feel.
  emptyAreaClickPan: false,
  holdToPan: true,

  // Keyboard options
  arrowKeysPan: true,
  wasdPan: false,
  ijklPan: false,
  
  // Pan speed (pixels per key press)
  keyboardPanSpeed: 20
};