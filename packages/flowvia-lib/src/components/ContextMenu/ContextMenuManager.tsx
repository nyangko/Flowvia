import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useUiStateStore, useUiStateStoreApi } from 'src/stores/uiStateStore';
import { generateId, findNearestUnoccupiedTile } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useModelStore } from 'src/stores/modelStore';
import { VIEW_ITEM_DEFAULTS } from 'src/config';
import { ContextMenu } from './ContextMenu';

interface Props {
  anchorEl?: HTMLElement | null;
}

export const ContextMenuManager = ({ anchorEl }: Props) => {
  const scene = useScene();
  const model = useModelStore((state) => {
    return state;
  });
  const contextMenu = useUiStateStore((state) => {
    return state.contextMenu;
  });
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const uiStateApi = useUiStateStoreApi();

  const [ menuItemsBeforeClosing, setMenuItemsBeforeClosing ] = useState([{ label: '', onClick:() => {} }]);

  const onClose = useCallback(() => {
    uiStateActions.setContextMenu(null);
  }, [uiStateActions]);

  const menuItems = useMemo(() => {
    if (!contextMenu) return menuItemsBeforeClosing;
    const uiState = uiStateApi.getState();

    if (contextMenu.type === 'SELECTION') {
      return [
        {
          label: 'Copy Selection',
          onClick: () => {
            scene.copyObjectsToClipboard(uiState);
            onClose();
          }
        }
      ]
    } else if (contextMenu.type === 'ITEM' && contextMenu.item) {
      const { type } = contextMenu.item;
      const itemTypeName = 
        type === 'ITEM' ? 'Node' :
        type === 'RECTANGLE' ? 'Rectangle' :
        type === 'TEXTBOX' ? 'Text' :
        undefined;
      
        if (!itemTypeName) return menuItemsBeforeClosing;
      return [
        {
          label: `Copy ${itemTypeName}`,
          onClick: () => {
            const uiState = uiStateApi.getState();
            scene.copyObjectsToClipboard(uiState, contextMenu.item);
            onClose();
          }
        }
      ]
    }
    return [
      {
        label: 'Add Node',
        onClick: () => {
          if (!contextMenu) return;
          if (model.icons.length > 0) {
            const modelItemId = generateId();
            const firstIcon = model.icons[0];
            
            // Find nearest unoccupied tile (should return the same tile since context menu is for empty tiles)
            const targetTile = findNearestUnoccupiedTile(contextMenu.tile, scene) || contextMenu.tile;

            scene.placeIcon({
              modelItem: {
                id: modelItemId,
                name: 'Untitled',
                icon: firstIcon.id
              },
              viewItem: {
                ...VIEW_ITEM_DEFAULTS,
                id: modelItemId,
                tile: targetTile
              }
            });
          }
          onClose();
        }
      },
      {
        label: 'Add Rectangle',
        onClick: () => {
          if (!contextMenu) return;
          if (model.colors.length > 0) {
            scene.createRectangle({
              id: generateId(),
              color: model.colors[0].id,
              from: contextMenu.tile,
              to: contextMenu.tile
            });
          }
          onClose();
        }
      },
      ...(uiState.isAnythingCopied ? [{ 
        label: 'Paste',
        onClick: () => {
          scene.pasteObjectsFromClipboard(uiState, scene);
          onClose();
        }
      }] : [])
    ]
  }, 
  [contextMenu && contextMenu.type, contextMenu?.item]);

  useEffect(() => setMenuItemsBeforeClosing(menuItems), [menuItems]);

  return (
    <ContextMenu
      anchorEl={anchorEl}
      onClose={onClose}
      menuItems={menuItems}
    />
  );
};
