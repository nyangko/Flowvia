import React, { memo, useCallback, useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton as MUIIconButton,
  Switch,
  Collapse
} from '@mui/material';
import { IconX as CloseIcon, IconGripVertical as DragIndicatorIcon } from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useConnector } from 'src/hooks/useConnector';
import { useColor } from 'src/hooks/useColor';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/stores/localeStore';
import { getConnectorLabels } from 'src/utils';
import { ControlsContainer } from '../components/ControlsContainer';
import { ConnectorControls } from './ConnectorControls';
import { ConnectorGroupControls as ConnectorGroupControlsType } from 'src/types';

interface ConnectorPickerRowProps {
  connectorId: string;
  index: number;
  isFocused: boolean;
  isDragging: boolean;
  onToggleFocus: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDragEnd: () => void;
}

const ConnectorPickerRow = memo(function ConnectorPickerRow({
  connectorId,
  index,
  isFocused,
  isDragging,
  onToggleFocus,
  onDragStart,
  onDragOver,
  onDragEnd
}: ConnectorPickerRowProps) {
  const connector = useConnector(connectorId);
  const colorData = useColor(connector?.color);
  const { updateConnector } = useScene();
  const labels = connector ? getConnectorLabels(connector) : [];
  const { t } = useTranslation();

  const displayColor = connector?.customColor || colorData?.value || '#9e9e9e';
  const primaryText =
    connector?.name ||
    labels[0]?.text ||
    t('itemControls.connector.connectorFallbackName').replace(
      '{number}',
      String(index + 1)
    );
  const styleLabel =
    connector?.style === 'DASHED'
      ? t('itemControls.connector.styleDashed')
      : connector?.style === 'DOTTED'
        ? t('itemControls.connector.styleDotted')
        : t('itemControls.connector.styleSolid');

  const handleClick = useCallback(() => {
    onToggleFocus(connectorId);
  }, [connectorId, onToggleFocus]);

  return (
    <Box
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(connectorId);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(connectorId);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => e.preventDefault()}
      sx={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderLeft: isFocused ? '2px solid' : '2px solid transparent',
          borderLeftColor: isFocused ? 'primary.main' : 'transparent',
          pl: 0.5
        }}
      >
        <Box
          component="span"
          sx={{ display: 'inline-flex', color: 'text.disabled', cursor: 'grab', mr: 0.5 }}
        >
          <DragIndicatorIcon size={20} />
        </Box>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: displayColor
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={primaryText}
          secondary={styleLabel}
          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
        <Switch
          size="small"
          checked={connector?.preventOverlap !== false}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (!connector) return;
            updateConnector(connector.id, {
              preventOverlap: e.target.checked
            });
          }}
        />
      </ListItemButton>
      <Collapse in={isFocused} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 2, pr: 1, pb: 1 }}>
          <ConnectorControls id={connectorId} embedded />
        </Box>
      </Collapse>
    </Box>
  );
});

interface Props {
  controls: ConnectorGroupControlsType;
}

export const ConnectorGroupControls = memo(function ConnectorGroupControls({
  controls
}: Props) {
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const { reorderConnectors } = useScene();
  const { t } = useTranslation();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    uiStateActions.setItemControls(null);
  }, [uiStateActions]);

  const handleToggleFocus = useCallback(
    (id: string) => {
      const newFocusedId = controls.focusedId === id ? null : id;
      uiStateActions.setItemControls({ ...controls, focusedId: newFocusedId });
    },
    [controls, uiStateActions]
  );

  // Live-reorders the picker as you drag over other rows; the underlying
  // model only gets updated once, on drag end, so undo/history isn't spammed
  // with an entry per hovered row.
  const handleDragOver = useCallback(
    (overId: string) => {
      if (!draggedId || draggedId === overId) return;

      const fromIndex = controls.ids.indexOf(draggedId);
      const toIndex = controls.ids.indexOf(overId);
      if (fromIndex === -1 || toIndex === -1) return;

      const newIds = [...controls.ids];
      newIds.splice(fromIndex, 1);
      newIds.splice(toIndex, 0, draggedId);

      uiStateActions.setItemControls({ ...controls, ids: newIds });
    },
    [controls, draggedId, uiStateActions]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    reorderConnectors(controls.ids);
  }, [controls.ids, reorderConnectors]);

  if (controls.ids.length === 1) {
    return <ConnectorControls id={controls.ids[0]} />;
  }

  return (
    <ControlsContainer
      header={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            pt: 2,
            pb: 1
          }}
        >
          <Typography variant="subtitle2" color="text.primary">
            {t('itemControls.connector.connectorsCount').replace(
              '{count}',
              String(controls.ids.length)
            )}
          </Typography>
          <MUIIconButton
            size="small"
            aria-label={t('itemControls.close')}
            onClick={handleClose}
          >
            <CloseIcon size={20} />
          </MUIIconButton>
        </Box>
      }
    >
      <List dense disablePadding>
        {controls.ids.map((id, index) => (
          <ConnectorPickerRow
            key={id}
            connectorId={id}
            index={index}
            isFocused={controls.focusedId === id}
            isDragging={draggedId === id}
            onToggleFocus={handleToggleFocus}
            onDragStart={setDraggedId}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        ))}
      </List>
    </ControlsContainer>
  );
});
