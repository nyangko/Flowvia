import { useScene } from 'src/hooks/useScene';
import { useSceneItem } from 'src/hooks/useSceneItem';

export const useViewItem = (id: string) => {
  const { items } = useScene();

  return useSceneItem(items, id);
};
