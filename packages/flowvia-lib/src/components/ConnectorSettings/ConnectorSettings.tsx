import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Slider,
  Typography,
  Paper
} from '@mui/material';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

export const ConnectorSettings = () => {
  const connectorInteractionMode = useUiStateStore((state) => state.connectorInteractionMode);
  const setConnectorInteractionMode = useUiStateStore((state) => state.actions.setConnectorInteractionMode);
  const connectorAnimationEnabled = useUiStateStore((state) => state.connectorAnimationEnabled);
  const setConnectorAnimationEnabled = useUiStateStore((state) => state.actions.setConnectorAnimationEnabled);
  const connectorAnimationSpeed = useUiStateStore((state) => state.connectorAnimationSpeed);
  const setConnectorAnimationSpeed = useUiStateStore((state) => state.actions.setConnectorAnimationSpeed);
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConnectorInteractionMode(event.target.value as 'click' | 'drag');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('settings.connector.title')}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('settings.connector.connectionMode')}</FormLabel>
          <RadioGroup
            value={connectorInteractionMode}
            onChange={handleChange}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="click"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">{t('settings.connector.clickMode')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.connector.clickModeDesc')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="drag"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">{t('settings.connector.dragMode')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.connector.dragModeDesc')}
                  </Typography>
                </Box>
              }
              sx={{ mt: 1 }}
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={connectorAnimationEnabled}
              onChange={(event) => {
                return setConnectorAnimationEnabled(event.target.checked);
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body1">{t('settings.connector.animation')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('settings.connector.animationDesc')}
              </Typography>
            </Box>
          }
        />
        {connectorAnimationEnabled && (
          <Box sx={{ mt: 2, px: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {`${t('settings.connector.animationSpeed')} (${connectorAnimationSpeed})`}
            </Typography>
            <Slider
              min={50}
              max={500}
              step={10}
              value={connectorAnimationSpeed}
              valueLabelDisplay="auto"
              onChange={(event, newSpeed) => {
                setConnectorAnimationSpeed(newSpeed as number);
              }}
            />
          </Box>
        )}
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {t('settings.connector.note')}
      </Typography>
    </Box>
  );
};