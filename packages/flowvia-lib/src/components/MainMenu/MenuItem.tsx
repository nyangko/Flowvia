import React from 'react';
import { MenuItem as MuiMenuItem, ListItemIcon, Typography } from '@mui/material';

export interface Props {
  onClick?: () => void;
  Icon?: React.ReactNode;
  children: string | React.ReactNode;
  disabled?: boolean;
  shortcut?: string;
}

export const MenuItem = ({
  onClick,
  Icon,
  children,
  disabled = false,
  shortcut
}: Props) => {
  return (
    <MuiMenuItem onClick={onClick} disabled={disabled}>
      <ListItemIcon sx={{ opacity: disabled ? 0.5 : 1 }}>{Icon}</ListItemIcon>
      <span style={{ flex: 1 }}>{children}</span>
      {shortcut && (
        <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
          {shortcut}
        </Typography>
      )}
    </MuiMenuItem>
  );
};
