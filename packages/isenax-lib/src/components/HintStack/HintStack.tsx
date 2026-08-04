import React, { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { IconX as ClearAllIcon } from '@tabler/icons-react';
import { ImportHintTooltip } from '../ImportHintTooltip/ImportHintTooltip';
import { ConnectorHintTooltip } from '../ConnectorHintTooltip/ConnectorHintTooltip';
import { LazyLoadingWelcomeNotification } from '../LazyLoadingWelcomeNotification/LazyLoadingWelcomeNotification';

// Keep in sync with the STORAGE_KEY constants in the three components below.
const HINT_STORAGE_KEYS = [
  'isenax_import_hint_dismissed',
  'isenax_connector_hint_dismissed',
  'isenax-lazy-loading-welcome-dismissed'
];

interface Props {
  showConnectorHint?: boolean;
  showLazyLoadingWelcome?: boolean;
}

// These three hints used to each fixed-position themselves independently
// (scattered across corners of the screen), with no way to dismiss them
// together. This stacks them in one spot with a single "dismiss all".
export const HintStack = ({ showConnectorHint, showLazyLoadingWelcome }: Props) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const relevantKeys = HINT_STORAGE_KEYS.filter((_key, i) => {
      if (i === 1) return showConnectorHint;
      if (i === 2) return showLazyLoadingWelcome;
      return true;
    });
    const count = relevantKeys.filter((key) => localStorage.getItem(key) !== 'true').length;
    setVisibleCount(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChildDismiss = () => setVisibleCount((count) => Math.max(0, count - 1));

  const handleDismissAll = () => {
    HINT_STORAGE_KEYS.forEach((key) => localStorage.setItem(key, 'true'));
    setVisibleCount(0);
  };

  if (visibleCount === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 90,
        right: 16,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: 320
      }}
    >
      {visibleCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Dismiss all">
            <IconButton size="small" onClick={handleDismissAll} sx={{ backgroundColor: 'background.paper' }}>
              <ClearAllIcon size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <ImportHintTooltip onDismiss={handleChildDismiss} />
      {showConnectorHint && <ConnectorHintTooltip onDismiss={handleChildDismiss} />}
      {showLazyLoadingWelcome && (
        <LazyLoadingWelcomeNotification onDismiss={handleChildDismiss} />
      )}
    </Box>
  );
};
