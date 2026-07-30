// Minimal line icons matching the app's neutral-grey UI, replacing emoji glyphs.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 18,
  height: 18
};

export const NewFileIcon = () => (
  <svg {...base}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
  </svg>
);

export const SaveIcon = () => (
  <svg {...base}>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M8 4v5h7V4" />
    <rect x="8" y="13" width="8" height="6" />
  </svg>
);

export const FolderIcon = () => (
  <svg {...base}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const DownloadIcon = () => (
  <svg {...base}>
    <path d="M12 3v11" />
    <path d="M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 19h16" />
  </svg>
);

export const CloudIcon = () => (
  <svg {...base}>
    <path d="M7 18a4 4 0 0 1-.5-7.97 5 5 0 0 1 9.79-1.5A3.5 3.5 0 0 1 16.5 18z" />
  </svg>
);
