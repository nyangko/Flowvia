import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { IconSearch as SearchIcon } from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const Searchbox = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      placeholder={t('itemControls.iconSelection.searchPlaceholder')}
      value={value}
      onChange={(e) => {
        return onChange(e.target.value as string);
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon size={20} />
          </InputAdornment>
        )
      }}
    />
  );
};
