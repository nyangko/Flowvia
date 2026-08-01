import React from 'react';
import { IconTrash as DeleteIcon } from '@tabler/icons-react';
import { Button } from '@mui/material';
import { useTranslation } from 'src/stores/localeStore';

interface Props {
  onClick: () => void;
}

export const DeleteButton = ({ onClick }: Props) => {
  const { t } = useTranslation();

  return (
    <Button
      color="error"
      size="small"
      variant="outlined"
      startIcon={<DeleteIcon />}
      onClick={onClick}
    >
      {t('common.delete')}
    </Button>
  );
};
