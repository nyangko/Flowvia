import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Typography, useTheme } from '@mui/material';
import { IconX as CloseIcon, IconMenu2 as MenuIcon } from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

const STORAGE_KEY = 'flowvia-lazy-loading-welcome-dismissed';

interface Props {
  onDismiss?: () => void;
}

export const LazyLoadingWelcomeNotification = ({ onDismiss }: Props) => {
  const { t } = useTranslation('lazyLoadingWelcome');
  const theme = useTheme();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if the notification has been dismissed before
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
      elevation={8}
      sx={{
        position: 'relative',
        p: 3,
        pr: 5,
        backgroundColor: 'background.paper',
        borderLeft: '6px solid',
        borderLeftColor: 'primary.main',
        boxShadow: theme.shadows[20]
      }}
    >
      <IconButton
        size="small"
        onClick={handleDismiss}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8
        }}
      >
        <CloseIcon size={20} />
      </IconButton>

      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
        {t('title')}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
        {t('message')}
      </Typography>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
        p: 1.5,
        bgcolor: 'action.hover',
        borderRadius: 1
      }}>
        <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
          <MenuIcon size={20} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {t('configPath')} <strong>{t('configPath2')}</strong>
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t('canDisable')}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontStyle: 'italic',
          fontWeight: 600,
          mt: 2,
          textAlign: 'right'
        }}
      >
        {t('signature')}
      </Typography>
    </Paper>
  );
};
