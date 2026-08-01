import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { IconX as CloseIcon } from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

const STORAGE_KEY = 'flowvia_connector_hint_dismissed';

interface Props {
  onDismiss?: () => void;
}

export const ConnectorHintTooltip = ({ onDismiss }: Props) => {
  const { t } = useTranslation('connectorHintTooltip');
  const connectorInteractionMode = useUiStateStore((state) => state.connectorInteractionMode);
  const modeType = useUiStateStore((state) => state.mode.type);
  const isConnecting = useUiStateStore((state) =>
    state.mode.type === 'CONNECTOR' ? state.mode.isConnecting : false
  );
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
        borderLeftColor: 'primary.main'
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

      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        {connectorInteractionMode === 'click' ? t('tipCreatingConnectors') : t('tipConnectorTools')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {connectorInteractionMode === 'click' ? (
          <>
            <strong>{t('clickInstructionStart')}</strong> {t('clickInstructionMiddle')} <strong>{t('clickInstructionStart')}</strong> {t('clickInstructionEnd')}
            {modeType === 'CONNECTOR' && isConnecting && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'primary.main' }}>
                {t('nowClickTarget')}
              </Box>
            )}
          </>
        ) : (
          <>
            <strong>{t('dragStart')}</strong> {t('dragEnd')}
          </>
        )}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {t('rerouteStart')} <strong>{t('rerouteMiddle')}</strong> {t('rerouteEnd')}
      </Typography>
    </Paper>
  );
};