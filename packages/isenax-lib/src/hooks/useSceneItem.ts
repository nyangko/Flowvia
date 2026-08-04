import { useMemo } from 'react';
import { getItemById } from 'src/utils';

export const useSceneItem = <T extends { id: string }>(
  collection: T[],
  id: string
): T | null => {
  return useMemo(() => {
    const item = getItemById(collection, id);
    return item ? item.value : null;
  }, [collection, id]);
};
