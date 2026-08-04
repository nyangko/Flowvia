import {
  IconFile,
  IconCloudUp,
  IconCloudDown,
  IconDownload,
  IconCloud,
  IconUpload,
  IconTrash,
  IconClock,
  IconLock,
  IconLockOpen
} from '@tabler/icons-react';

const SIZE = 18;

export const NewFileIcon = () => <IconFile size={SIZE} />;
export const SaveIcon = () => <IconCloudUp size={SIZE} />;
export const FolderIcon = () => <IconCloudDown size={SIZE} />;
export const DownloadIcon = () => <IconDownload size={SIZE} />;
export const CloudIcon = () => <IconCloud size={SIZE} />;
export const UploadIcon = () => <IconUpload size={SIZE} />;
export const TrashIcon = () => <IconTrash size={SIZE} />;
export const HistoryIcon = () => <IconClock size={SIZE} />;
export const LockIcon = () => <IconLock size={SIZE} />;
export const UnlockIcon = () => <IconLockOpen size={SIZE} />;
