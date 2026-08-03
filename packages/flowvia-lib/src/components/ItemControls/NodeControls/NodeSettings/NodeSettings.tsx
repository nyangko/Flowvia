import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Slider,
  Box,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton as MUIIconButton
} from '@mui/material';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { ModelItem, ViewItem } from 'src/types';
import { RichTextEditor } from 'src/components/RichTextEditor/RichTextEditor';
import { useModelItem } from 'src/hooks/useModelItem';
import { useModelStore } from 'src/stores/modelStore';
import { useTranslation } from 'src/stores/localeStore';
import { DeleteButton } from '../../components/DeleteButton';
import { Section } from '../../components/Section';

export type NodeUpdates = {
  model: Partial<ModelItem>;
  view: Partial<ViewItem>;
};

interface SteppedSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

// Slider + numeric stepper for the label height / icon size controls — lets
// users drag for a rough value or type/step to an exact one, with the
// min/max range always visible instead of implied by the slider alone.
const SteppedSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange
}: SteppedSliderProps) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          textTransform="uppercase"
        >
          {label}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <MUIIconButton size="small" onClick={() => onChange(clamp(value - step))}>
            <IconMinus size={14} />
          </MUIIconButton>
          <TextField
            size="small"
            type="number"
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{unit}</InputAdornment>
            }}
            sx={{ width: 90 }}
          />
          <MUIIconButton size="small" onClick={() => onChange(clamp(value + step))}>
            <IconPlus size={14} />
          </MUIIconButton>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Typography variant="caption" color="text.secondary">
          {min}{unit}
        </Typography>
        <Slider
          marks
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e, newValue) => onChange(newValue as number)}
          sx={{ flex: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {max}{unit}
        </Typography>
      </Stack>
    </Box>
  );
};

interface Props {
  node: ViewItem;
  onModelItemUpdated: (updates: Partial<ModelItem>) => void;
  onViewItemUpdated: (updates: Partial<ViewItem>) => void;
  onDeleted: () => void;
}

export const NodeSettings = ({
  node,
  onModelItemUpdated,
  onViewItemUpdated,
  onDeleted
}: Props) => {
  const modelItem = useModelItem(node.id);
  const modelActions = useModelStore((state) => state.actions);
  const icons = useModelStore((state) => state.icons);
  const { t } = useTranslation();
  
  // Local state for smooth slider interaction
  const currentIcon = icons.find(icon => icon.id === modelItem?.icon);
  const [localScale, setLocalScale] = useState(currentIcon?.scale || 0.7);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update local scale when icon changes
  useEffect(() => {
    setLocalScale(currentIcon?.scale || 0.7);
  }, [currentIcon?.scale]);

  // Debounced update to store
  const updateIconScale = useCallback((scale: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      const updatedIcons = icons.map(icon => 
        icon.id === modelItem?.icon 
          ? { ...icon, scale }
          : icon
      );
      modelActions.set({ icons: updatedIcons });
    }, 100); // 100ms debounce
  }, [icons, modelItem?.icon, modelActions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!modelItem) {
    return null;
  }

  return (
    <>
      <Typography variant="subtitle2" fontWeight={600} sx={{ px: 3, pt: 3 }}>
        {t('itemControls.node.basicInfoSection')}
      </Typography>
      <Section title={t('itemControls.node.name')}>
        <TextField
          value={modelItem.name}
          onChange={(e) => {
            const text = e.target.value as string;
            if (modelItem.name !== text) onModelItemUpdated({ name: text });
          }}
        />
      </Section>
      <Section title={t('itemControls.node.description')}>
        <RichTextEditor
          value={modelItem.description}
          onChange={(text) => {
            if (modelItem.description !== text)
              onModelItemUpdated({ description: text });
          }}
        />
      </Section>

      <Typography variant="subtitle2" fontWeight={600} sx={{ px: 3, pt: 3 }}>
        {t('itemControls.node.appearanceSection')}
      </Typography>
      {modelItem.name && (
        <Section>
          <SteppedSlider
            label={t('itemControls.node.labelHeight')}
            value={node.labelHeight ?? 80}
            min={60}
            max={280}
            step={20}
            unit="px"
            onChange={(labelHeight) => onViewItemUpdated({ labelHeight })}
          />
        </Section>
      )}

      <Section>
        <SteppedSlider
          label={t('itemControls.node.iconSize')}
          value={Math.round(localScale * 100)}
          min={30}
          max={150}
          step={10}
          unit="%"
          onChange={(pct) => {
            const scale = pct / 100;
            setLocalScale(scale);
            updateIconScale(scale);
          }}
        />
      </Section>
      <Section>
        <Box>
          <DeleteButton onClick={onDeleted} />
        </Box>
      </Section>
    </>
  );
};
