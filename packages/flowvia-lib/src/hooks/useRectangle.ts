import { useScene } from 'src/hooks/useScene';
import { useSceneItem } from 'src/hooks/useSceneItem';

export const useRectangle = (id: string) => {
  const { rectangles } = useScene();

  return useSceneItem(rectangles, id);
};
