import { useScene } from 'src/hooks/useScene';
import { useSceneItem } from 'src/hooks/useSceneItem';

export const useTextBox = (id: string) => {
  const { textBoxes } = useScene();

  return useSceneItem(textBoxes, id);
};
