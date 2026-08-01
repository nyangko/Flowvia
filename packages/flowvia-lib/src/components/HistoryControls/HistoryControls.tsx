import React, { useCallback } from 'react';
import { Stack } from '@mui/material';
import { IconArrowBackUp as UndoIcon, IconArrowForwardUp as RedoIcon } from '@tabler/icons-react';
import { IconButton } from 'src/components/IconButton/IconButton';
import { UiElement } from 'src/components/UiElement/UiElement';
import { useHistory } from 'src/hooks/useHistory';
import { useTranslation } from 'src/stores/localeStore';

export const HistoryControls = () => {
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { t } = useTranslation('mainMenu');

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  return (
    <UiElement>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          name={`${t('undo')} (Ctrl+Z)`}
          Icon={<UndoIcon />}
          onClick={handleUndo}
          disabled={!canUndo}
        />
        <IconButton
          name={`${t('redo')} (Ctrl+Y)`}
          Icon={<RedoIcon />}
          onClick={handleRedo}
          disabled={!canRedo}
        />
      </Stack>
    </UiElement>
  );
};
