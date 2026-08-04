import React from 'react';
import { IconTrash as DeleteIcon } from '@tabler/icons-react';
import { Button } from '@mui/material';
import { useTranslation } from 'src/stores/localeStore';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  onClick: () => void;
}

export const DeleteButton = ({ onClick }: Props) => {
  const { t } = useTranslation();
  const isReadOnly = useUiStateStore((state) => state.editorMode !== 'EDITABLE');

  return (
    <Button
      color="error"
      size="small"
      variant="outlined"
      startIcon={<DeleteIcon size={20} />}
      onClick={onClick}
      disabled={isReadOnly}
    >
      {t('common.delete')}
    </Button>
  );
};
