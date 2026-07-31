import { useScene } from 'src/hooks/useScene';
import { useSceneItem } from 'src/hooks/useSceneItem';

export const useConnector = (id: string) => {
  const { connectors } = useScene();

  return useSceneItem(connectors, id);
};
