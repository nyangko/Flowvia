import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { IconX as CloseIcon, IconFolderOpen as FolderOpenIcon } from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

const STORAGE_KEY = 'isenax_import_hint_dismissed';

interface Props {
  onDismiss?: () => void;
}

export const ImportHintTooltip = ({ onDismiss }: Props) => {
  const { t } = useTranslation('importHintTooltip');
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if the hint has been dismissed before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== 'true') {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'relative',
        p: 2,
        pr: 5,
        backgroundColor: 'background.paper',
        borderLeft: '4px solid',
        borderLeftColor: 'info.main'
      }}
    >
      <IconButton
        size="small"
        onClick={handleDismiss}
        sx={{
          position: 'absolute',
          right: 4,
          top: 4
        }}
      >
        <CloseIcon size={20} />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box component="span" sx={{ display: 'inline-flex', mr: 1, color: 'info.main' }}>
          <FolderOpenIcon size={20} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('title')}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {t('instructionStart')} <strong>{t('menuButton')}</strong> {t('instructionMiddle')} <strong>{t('openButton')}</strong> {t('instructionEnd')}
      </Typography>
    </Paper>
  );
};