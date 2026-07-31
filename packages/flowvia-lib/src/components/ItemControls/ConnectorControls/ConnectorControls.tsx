import React, { useState, useMemo } from 'react';
import {
  Connector,
  ConnectorLabel,
  connectorStyleOptions
} from 'src/types';
import {
  Box,
  Slider,
  Select,
  MenuItem,
  TextField,
  IconButton as MUIIconButton,
  FormControlLabel,
  Switch,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { useConnector } from 'src/hooks/useConnector';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { ColorPicker } from 'src/components/ColorSelector/ColorPicker';
import { CustomColorInput } from 'src/components/ColorSelector/CustomColorInput';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import {
  Close as CloseIcon,
  Add as AddIcon,
  DeleteOutlined as DeleteIcon
} from '@mui/icons-material';
import { getConnectorLabels, generateId } from 'src/utils';
import { useTranslation } from 'src/stores/localeStore';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';

interface Props {
  id: string;
  embedded?: boolean;
}

export const ConnectorControls = ({ id, embedded }: Props) => {
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const connector = useConnector(id);
  const { updateConnector, deleteConnector } = useScene();
  const [useCustomColor, setUseCustomColor] = useState(
    !!connector?.customColor
  );
  const { t } = useTranslation();

  // Get all labels (including migrated legacy labels)
  const labels = useMemo(() => {
    if (!connector) return [];
    return getConnectorLabels(connector);
  }, [connector]);

  // If connector doesn't exist, return null
  if (!connector) {
    return null;
  }

  const handleAddLabel = () => {
    if (labels.length >= 256) return;

    const newLabel: ConnectorLabel = {
      id: generateId(),
      text: '',
      position: 50,
      height: 0,
      line: '1'
    };

    // Migrate legacy labels if needed and add new label
    const updatedLabels = [...labels, newLabel];
    updateConnector(connector.id, {
      labels: updatedLabels,
      // Clear legacy fields on first new label addition
      description: undefined,
      startLabel: undefined,
      endLabel: undefined,
      startLabelHeight: undefined,
      centerLabelHeight: undefined,
      endLabelHeight: undefined
    });
  };

  const handleUpdateLabel = (
    labelId: string,
    updates: Partial<ConnectorLabel>
  ) => {
    const updatedLabels = labels.map((label) => {
      return label.id === labelId ? { ...label, ...updates } : label;
    });

    updateConnector(connector.id, {
      labels: updatedLabels,
      // Clear legacy fields
      description: undefined,
      startLabel: undefined,
      endLabel: undefined,
      startLabelHeight: undefined,
      centerLabelHeight: undefined,
      endLabelHeight: undefined
    });
  };

  const handleDeleteLabel = (labelId: string) => {
    const updatedLabels = labels.filter((label) => {
      return label.id !== labelId;
    });
    updateConnector(connector.id, {
      labels: updatedLabels,
      // Clear legacy fields
      description: undefined,
      startLabel: undefined,
      endLabel: undefined,
      startLabelHeight: undefined,
      centerLabelHeight: undefined,
      endLabelHeight: undefined
    });
  };

  const sections = (
    <>
      <Section title={t('itemControls.connector.labels')}>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('itemControls.connector.labelsCount')
                  .replace('{count}', String(labels.length))
                  .replace('{max}', '256')}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddLabel}
                disabled={labels.length >= 256}
                size="small"
                variant="outlined"
              >
                {t('itemControls.connector.addLabel')}
              </Button>
            </Box>

            {labels.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 2 }}
              >
                {t('itemControls.connector.noLabels')}
              </Typography>
            )}

            {labels.map((label, index) => {
              return (
                <Paper key={label.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {t('itemControls.connector.labelNumber').replace(
                        '{number}',
                        String(index + 1)
                      )}
                    </Typography>
                    <MUIIconButton
                      size="small"
                      aria-label={t('itemControls.connector.deleteLabel')}
                      onClick={() => {
                        return handleDeleteLabel(label.id);
                      }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </MUIIconButton>
                  </Box>

                  <TextField
                    label={t('itemControls.connector.labelText')}
                    value={label.text}
                    onChange={(e) => {
                      return handleUpdateLabel(label.id, {
                        text: e.target.value
                      });
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label={t('itemControls.connector.position')}
                      type="number"
                      value={label.position}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        // Allow empty input
                        if (inputValue === '') {
                          handleUpdateLabel(label.id, { position: 0 });
                          return;
                        }

                        const value = parseInt(inputValue, 10);
                        if (!Number.isNaN(value)) {
                          handleUpdateLabel(label.id, {
                            position: Math.max(0, Math.min(100, value))
                          });
                        }
                      }}
                      onBlur={(e) => {
                        // On blur, ensure we have a valid value
                        if (e.target.value === '') {
                          handleUpdateLabel(label.id, { position: 0 });
                        }
                      }}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{ flex: 1 }}
                    />

                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('itemControls.connector.heightOffset')}
                    </Typography>
                    <Slider
                      marks
                      step={10}
                      min={-100}
                      max={100}
                      value={label.height || 0}
                      onChange={(e, value) => {
                        return handleUpdateLabel(label.id, {
                          height: value as number
                        });
                      }}
                    />
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={label.showLine !== false}
                          onChange={(e) => {
                            return handleUpdateLabel(label.id, {
                              showLine: e.target.checked
                            });
                          }}
                        />
                      }
                      label={t('itemControls.connector.showDottedLine')}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Section>
        <Section title={t('itemControls.color')}>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomColor}
                onChange={(e) => {
                  setUseCustomColor(e.target.checked);
                  if (!e.target.checked) {
                    updateConnector(connector.id, { customColor: '' });
                  }
                }}
              />
            }
            label={t('itemControls.useCustomColor')}
            sx={{ mb: 2 }}
          />
          {useCustomColor ? (
            <CustomColorInput
              value={connector.customColor || '#000000'}
              onChange={(color) => {
                updateConnector(connector.id, { customColor: color });
              }}
            />
          ) : (
            <ColorSelector
              onChange={(color) => {
                return updateConnector(connector.id, {
                  color,
                  customColor: ''
                });
              }}
              activeColor={connector.color}
            />
          )}
        </Section>
        <Section title={t('itemControls.connector.width')}>
          <Slider
            marks
            step={10}
            min={10}
            max={30}
            value={connector.width}
            onChange={(e, newWidth) => {
              updateConnector(connector.id, { width: newWidth as number });
            }}
          />
        </Section>
        <Section title={t('itemControls.connector.lineStyle')}>
          <Select
            value={connector.style || 'SOLID'}
            onChange={(e) => {
              updateConnector(connector.id, {
                style: e.target.value as Connector['style']
              });
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            {Object.values(connectorStyleOptions).map((style) => {
              return (
                <MenuItem key={style} value={style}>
                  {style}
                </MenuItem>
              );
            })}
          </Select>
        </Section>
        <Section>
          <FormControlLabel
            control={
              <Switch
                checked={connector.showArrow !== false}
                onChange={(e) => {
                  updateConnector(connector.id, {
                    showArrow: e.target.checked
                  });
                }}
              />
            }
            label={t('itemControls.connector.showArrow')}
          />
        </Section>
      <Section>
        <Box>
          <DeleteButton
            onClick={() => {
              uiStateActions.setItemControls(null);
              deleteConnector(connector.id);
            }}
          />
        </Box>
      </Section>
    </>
  );

  if (embedded) {
    return <Box sx={{ pb: 2 }}>{sections}</Box>;
  }

  return (
    <ControlsContainer>
      <Box
        sx={{ position: 'relative', paddingTop: '24px', paddingBottom: '24px' }}
      >
        <MUIIconButton
          aria-label={t('itemControls.close')}
          onClick={() => {
            return uiStateActions.setItemControls(null);
          }}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2
          }}
          size="small"
        >
          <CloseIcon />
        </MUIIconButton>
        {sections}
      </Box>
    </ControlsContainer>
  );
};
