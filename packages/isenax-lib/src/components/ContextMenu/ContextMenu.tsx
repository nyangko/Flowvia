import React from 'react';
import { Menu, Divider } from '@mui/material';
import { MenuItem } from 'src/components/MainMenu/MenuItem';

interface MenuItemI {
  label?: string;
  onClick?: () => void;
  Icon?: React.ReactNode;
  shortcut?: string;
  isDivider?: boolean;
}

interface Props {
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  menuItems: MenuItemI[];
}

export const ContextMenu = ({
  onClose,
  anchorEl,
  menuItems
}: Props) => {
  return (
    <Menu
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
    >
      {menuItems.map((item, index) => {
        if (item.isDivider) {
          return <Divider key={index} sx={{ my: 0.5 }} />;
        }

        return (
          <MenuItem key={index} onClick={item.onClick} Icon={item.Icon} shortcut={item.shortcut}>
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
