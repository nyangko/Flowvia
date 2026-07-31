import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ContentCopy as ContentCopyIcon,
  ContentPaste as ContentPasteIcon,
  FileCopyOutlined as DuplicateIcon,
  AddOutlined as AddNodeIcon,
  CropSquareOutlined as AddRectangleIcon,
  EastOutlined as AddConnectorIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon
} from '@mui/icons-material';
import { useUiStateStore, useUiStateStoreApi } from 'src/stores/uiStateStore';
import { generateId, findNearestUnoccupiedTile } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useModelStore } from 'src/stores/modelStore';
import { VIEW_ITEM_DEFAULTS } from 'src/config';
import { useTranslation } from 'src/stores/localeStore';
import { Connector as ConnectorI, Coords } from 'src/types';
import { ContextMenu } from './ContextMenu';

interface Props {
  anchorEl?: HTMLElement | null;
}

export const ContextMenuManager = ({ anchorEl }: Props) => {
  const scene = useScene();
  const { t } = useTranslation('contextMenu');
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

  // Shared by the empty-space menu and the connector menu (right-clicking a
  // connector should let you drop a node at that spot too).
  const buildAddNodeItem = useCallback((tile: Coords) => ({
    label: t('addNode'),
    Icon: <AddNodeIcon fontSize="small" />,
    onClick: () => {
      if (model.icons.length > 0) {
        const modelItemId = generateId();
        const firstIcon = model.icons[0];
        const targetTile = findNearestUnoccupiedTile(tile, scene) || tile;

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
  }), [model.icons, scene, onClose, t]);

  const menuItems = useMemo(() => {
    if (!contextMenu) return menuItemsBeforeClosing;
    const uiState = uiStateApi.getState();

    if (contextMenu.type === 'SELECTION') {
      return [
        {
          label: t('copySelection'),
          Icon: <ContentCopyIcon fontSize="small" />,
          shortcut: 'Ctrl+C',
          onClick: () => {
            scene.copyObjectsToClipboard(uiState);
            onClose();
          }
        },
        {
          label: t('deleteSelection'),
          Icon: <DeleteIcon fontSize="small" />,
          onClick: () => {
            scene.deleteObjects(uiState);
            onClose();
          }
        }
      ]
    } else if (contextMenu.type === 'ITEM' && contextMenu.item?.type === 'CONNECTOR') {
      // No "copy" option here — copying a connector on its own (detached from
      // the nodes it links) isn't a meaningful operation, unlike nodes/
      // rectangles/text. This case used to fall through to whatever menu was
      // shown previously (e.g. a stale "Copy Node"); now it's handled directly.
      const connectorId = contextMenu.item.id;

      return [
        buildAddNodeItem(contextMenu.tile),
        {
          label: t('addConnector'),
          Icon: <AddConnectorIcon fontSize="small" />,
          onClick: () => {
            const newConnector: ConnectorI = {
              id: generateId(),
              color: scene.colors[0].id,
              anchors: [
                { id: generateId(), ref: { tile: contextMenu.tile } },
                { id: generateId(), ref: { tile: contextMenu.tile } }
              ]
            };

            scene.createConnector(newConnector);

            uiStateActions.setMode({
              type: 'CONNECTOR',
              showCursor: true,
              id: newConnector.id,
              startAnchor: { tile: contextMenu.tile },
              isConnecting: true
            });

            onClose();
          }
        },
        {
          label: t('editConnector'),
          Icon: <EditIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls({ type: 'CONNECTOR', id: connectorId });
            onClose();
          }
        },
        {
          label: t('deleteConnector'),
          Icon: <DeleteIcon fontSize="small" />,
          onClick: () => {
            scene.deleteConnector(connectorId);
            onClose();
          }
        },
        // Several connector paths can cross the same tile — when that's the
        // case, offer group actions instead of only acting on whichever one
        // getItemAtTile happened to pick.
        ...(contextMenu.groupIds ? [
          {
            label: t('editConnectorsHere').replace('{count}', String(contextMenu.groupIds.length)),
            Icon: <EditIcon fontSize="small" />,
            onClick: () => {
              uiStateActions.setItemControls({
                type: 'CONNECTOR_GROUP',
                ids: contextMenu.groupIds!,
                focusedId: null
              });
              onClose();
            }
          },
          {
            label: t('deleteConnectorsHere').replace('{count}', String(contextMenu.groupIds.length)),
            Icon: <DeleteIcon fontSize="small" />,
            onClick: () => {
              const ids = contextMenu.groupIds!;
              scene.transaction(() => {
                ids.forEach((id) => scene.deleteConnector(id));
              });
              onClose();
            }
          }
        ] : [])
      ];
    } else if (contextMenu.type === 'ITEM' && contextMenu.item) {
      const { type } = contextMenu.item;
      const copyLabel =
        type === 'ITEM' ? t('copyNode') :
        type === 'RECTANGLE' ? t('copyRectangle') :
        type === 'TEXTBOX' ? t('copyText') :
        undefined;
      const duplicateLabel =
        type === 'ITEM' ? t('duplicateNode') :
        type === 'RECTANGLE' ? t('duplicateRectangle') :
        type === 'TEXTBOX' ? t('duplicateText') :
        undefined;

        if (!copyLabel) return menuItemsBeforeClosing;

      const itemMenuItems = [
        {
          label: copyLabel,
          Icon: <ContentCopyIcon fontSize="small" />,
          shortcut: 'Ctrl+C',
          onClick: () => {
            const uiState = uiStateApi.getState();
            scene.copyObjectsToClipboard(uiState, contextMenu.item);
            onClose();
          }
        },
        ...(duplicateLabel ? [{
          label: duplicateLabel,
          Icon: <DuplicateIcon fontSize="small" />,
          onClick: () => {
            if (!contextMenu.item) return;
            scene.duplicateItem(contextMenu.item, scene);
            onClose();
          }
        }] : [])
      ];

      if (type === 'ITEM') {
        const nodeId = contextMenu.item.id;

        itemMenuItems.push({
          label: t('editNode'),
          Icon: <EditIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls({ type: 'ITEM', id: nodeId });
            onClose();
          }
        });

        itemMenuItems.push({
          label: t('addConnector'),
          Icon: <AddConnectorIcon fontSize="small" />,
          onClick: () => {
            const newConnector: ConnectorI = {
              id: generateId(),
              color: scene.colors[0].id,
              anchors: [
                { id: generateId(), ref: { item: nodeId } },
                { id: generateId(), ref: { item: nodeId } }
              ]
            };

            scene.createConnector(newConnector);

            uiStateActions.setMode({
              type: 'CONNECTOR',
              showCursor: true,
              id: newConnector.id,
              startAnchor: { itemId: nodeId },
              isConnecting: true
            });

            onClose();
          }
        });

        itemMenuItems.push({
          label: t('deleteNode'),
          Icon: <DeleteIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls(null);
            scene.deleteViewItem(nodeId);
            onClose();
          }
        });
      } else if (type === 'RECTANGLE') {
        const rectangleId = contextMenu.item.id;

        itemMenuItems.push({
          label: t('editRectangle'),
          Icon: <EditIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls({ type: 'RECTANGLE', id: rectangleId });
            onClose();
          }
        });

        itemMenuItems.push({
          label: t('deleteRectangle'),
          Icon: <DeleteIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls(null);
            scene.deleteRectangle(rectangleId);
            onClose();
          }
        });
      } else if (type === 'TEXTBOX') {
        const textBoxId = contextMenu.item.id;

        itemMenuItems.push({
          label: t('editText'),
          Icon: <EditIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls({ type: 'TEXTBOX', id: textBoxId });
            onClose();
          }
        });

        itemMenuItems.push({
          label: t('deleteText'),
          Icon: <DeleteIcon fontSize="small" />,
          onClick: () => {
            uiStateActions.setItemControls(null);
            scene.deleteTextBox(textBoxId);
            onClose();
          }
        });
      }

      return itemMenuItems;
    }
    return [
      buildAddNodeItem(contextMenu.tile),
      {
        label: t('addRectangle'),
        Icon: <AddRectangleIcon fontSize="small" />,
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
        label: t('paste'),
        Icon: <ContentPasteIcon fontSize="small" />,
        shortcut: 'Ctrl+V',
        onClick: () => {
          scene.pasteObjectsFromClipboard(uiState, scene);
          onClose();
        }
      }] : [])
    ]
  },
  // Depend on the whole object (a fresh reference every setContextMenu call) so the
  // menu's onClick closures always capture the *current* right-click tile — depending
  // only on `type`/`item` let repeated EMPTY-space right-clicks reuse a stale `tile`
  // from whichever click first transitioned the menu into that type.
  [contextMenu]);

  useEffect(() => setMenuItemsBeforeClosing(menuItems), [menuItems]);

  return (
    <ContextMenu
      anchorEl={anchorEl}
      onClose={onClose}
      menuItems={menuItems}
    />
  );
};
