import { useCallback, useEffect, useRef } from 'react';
import { useUiStateStore, useUiStateStoreApi } from 'src/stores/uiStateStore';
import { CoordsUtils, getItemAtTile } from 'src/utils';
import { hasMovedTile } from 'src/utils/renderer';
import { useScene } from 'src/hooks/useScene';
import { SlimMouseEvent } from 'src/types';

// How long a plain left-click on empty space must be held before it
// auto-switches to Pan mode (issue #15).
const HOLD_TO_PAN_DELAY_MS = 300;
// A hold-triggered pan wasn't a deliberate modifier-click, so ease back to
// the previous mode after release instead of snapping back instantly.
const HOLD_TO_PAN_RELEASE_DELAY_MS = 150;

export const usePanHandlers = () => {
  const modeType = useUiStateStore((state) => state.mode.type);
  const actions = useUiStateStore((state) => state.actions);
  const panSettings = useUiStateStore((state) => state.panSettings);
  const rendererEl = useUiStateStore((state) => state.rendererEl);
  const mouseTile = useUiStateStore((state) => state.mouse.position.tile);
  const uiStateApi = useUiStateStoreApi();
  const scene = useScene();
  const isPanningRef = useRef(false);
  const prevModeRef = useRef(uiStateApi.getState().mode);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTriggeredRef = useRef(false);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const startPan = useCallback(() => {
    if (modeType !== 'PAN') {
      isPanningRef.current = true;
      prevModeRef.current = uiStateApi.getState().mode;
      actions.setMode({
        type: 'PAN',
        showCursor: false,
        temp: true
      });
    }
  }, [modeType, actions]);

  const endPan = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      actions.setMode(prevModeRef.current);
    }
  }, [modeType, actions]);

  const isEmptyArea = useCallback((e: SlimMouseEvent): boolean => {
    if (!rendererEl || e.target !== rendererEl) return false;

    const itemAtTile = getItemAtTile({
      tile: mouseTile,
      scene
    });

    return !itemAtTile;
  }, [rendererEl, mouseTile, scene]);

  const handleMouseDown = useCallback((e: SlimMouseEvent): boolean => {
    if (
      (e.button === 1 && panSettings.middleClickPan) ||
      (e.button === 2 && panSettings.rightClickPan) ||
      (e.button === 0) && (
        (panSettings.ctrlClickPan && e.ctrlKey) ||
        (panSettings.altClickPan && e.altKey) ||
        (panSettings.emptyAreaClickPan && isEmptyArea(e))
      )) {
      e.preventDefault();
      startPan();
      return true;
    }

    // Holding a plain left click on empty space (no modifier, and none of the
    // instant-pan triggers above matched) auto-switches to Pan after a delay,
    // so panning doesn't require a modifier key or switching tools. Scoped to
    // empty area only, same as emptyAreaClickPan, so holding on an item still
    // lets you drag it instead of hijacking the gesture into Pan.
    if (e.button === 0 && panSettings.holdToPan && isEmptyArea(e)) {
      clearHoldTimer();
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null;
        const stillHeld = uiStateApi.getState().mouse;
        // A real drag (marquee-select, etc.) already claimed this gesture via
        // Cursor's own mousemove handling, or something else changed the mode
        // while we waited — don't clobber whatever's happening now.
        if (hasMovedTile(stillHeld) || uiStateApi.getState().mode.type !== 'CURSOR') {
          return;
        }
        holdTriggeredRef.current = true;
        startPan();
      }, HOLD_TO_PAN_DELAY_MS);
    }

    return false;
  }, [panSettings, startPan, isEmptyArea, clearHoldTimer, uiStateApi]);

  const handleMouseUp = useCallback((e: SlimMouseEvent): boolean => {
    clearHoldTimer();
    if (isPanningRef.current) {
      if (holdTriggeredRef.current) {
        holdTriggeredRef.current = false;
        setTimeout(endPan, HOLD_TO_PAN_RELEASE_DELAY_MS);
      } else {
        endPan();
      }
      return true;
    }
    return false;
  }, [endPan, clearHoldTimer]);

  // Clear any pending hold-timer on unmount so it can't fire after teardown.
  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('.ql-editor')
      ) {
        return;
      }

      const currentState = uiStateApi.getState();
      const currentPanSettings = currentState.panSettings;
      const speed = currentPanSettings.keyboardPanSpeed;
      let dx = 0;
      let dy = 0;

      if (currentPanSettings.arrowKeysPan) {
        if (e.key === 'ArrowUp') {
          dy = speed;
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          dy = -speed;
          e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
          dx = speed;
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          dx = -speed;
          e.preventDefault();
        }
      }

      if (currentPanSettings.wasdPan) {
        const key = e.key.toLowerCase();
        if (key === 'w') {
          dy = speed;
          e.preventDefault();
        } else if (key === 's') {
          dy = -speed;
          e.preventDefault();
        } else if (key === 'a') {
          dx = speed;
          e.preventDefault();
        } else if (key === 'd') {
          dx = -speed;
          e.preventDefault();
        }
      }

      if (currentPanSettings.ijklPan) {
        const key = e.key.toLowerCase();
        if (key === 'i') {
          dy = speed;
          e.preventDefault();
        } else if (key === 'k') {
          dy = -speed;
          e.preventDefault();
        } else if (key === 'j') {
          dx = speed;
          e.preventDefault();
        } else if (key === 'l') {
          dx = -speed;
          e.preventDefault();
        }
      }

      if (dx !== 0 || dy !== 0) {
        const currentScroll = currentState.scroll;
        const newPosition = CoordsUtils.add(
          currentScroll.position,
          { x: dx, y: dy }
        );
        currentState.actions.setScroll({
          position: newPosition,
          offset: currentScroll.offset
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uiStateApi]);

  return {
    handleMouseDown,
    handleMouseUp,
    isPanning: isPanningRef.current
  };
};
