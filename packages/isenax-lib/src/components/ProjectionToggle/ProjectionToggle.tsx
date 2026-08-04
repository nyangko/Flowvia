import React from 'react';
import { IconCube as IsometricIcon, IconGrid4x4 as FlatIcon } from '@tabler/icons-react';
import { UiElement } from 'src/components/UiElement/UiElement';
import { IconButton } from 'src/components/IconButton/IconButton';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

export const ProjectionToggle = () => {
  const { t } = useTranslation('viewControls');
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const isFlat = useUiStateStore((state) => {
    return state.projectionMode === 'FLAT';
  });

  return (
    <UiElement>
      <IconButton
        name={isFlat ? t('switchToIsometricView') : t('switchToFlatView')}
        Icon={isFlat ? <FlatIcon size={20} /> : <IsometricIcon size={20} />}
        onClick={() => {
          uiStateActions.setProjectionMode(isFlat ? 'ISOMETRIC' : 'FLAT');
        }}
      />
    </UiElement>
  );
};
