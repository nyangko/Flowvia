import React from 'react';
import { Box, Divider } from '@mui/material';
import { clickStopperProps } from 'src/utils';

interface Props {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const ControlsContainer = ({ header, footer, children }: Props) => {
  return (
    <Box
      {...clickStopperProps}
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        pb: footer ? 0 : 2
      }}
    >
      {header && (
        <Box
          sx={{
            width: '100%',
            zIndex: 1,
            position: 'sticky',
            bgcolor: 'background.paper',
            top: 0
          }}
        >
          {header}
          <Divider />
        </Box>
      )}
      <Box
        sx={{
          width: '100%',
          flexGrow: 1
        }}
      >
        <Box sx={{ width: '100%' }}>{children}</Box>
      </Box>
      {footer && (
        <Box
          sx={{
            width: '100%',
            zIndex: 1,
            position: 'sticky',
            bottom: 0,
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 1.5
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};
