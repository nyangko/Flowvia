import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import { Box } from '@mui/material';
import { DOMErrorBoundary } from 'src/components/DOMErrorBoundary';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number;
  styles?: React.CSSProperties;
}

// Rich text formatting tools
const tools = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  { header: [1, 2, 3, false] },
  { list: 'ordered' },
  { list: 'bullet' },
  'blockquote',
  'code-block'
];

// Formats that Quill should recognize
const formats = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'header',
  'list',
  'blockquote',
  'code-block'
];

export const RichTextEditor = ({
  value,
  onChange,
  readOnly,
  height = 120,
  styles
}: Props) => {
  const modules = useMemo(() => {
    if (!readOnly)
      return {
        toolbar: tools
      };

    return { toolbar: false };
  }, [readOnly]);

  return (
    <DOMErrorBoundary
      fallback={
        <div
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            color: '#666'
          }}
        >
          Rich text editor temporarily unavailable
        </div>
      }
    >
      <Box
        sx={{
          // Toolbar and text area share one bordered box (divided by the
          // toolbar's own border-bottom) instead of each having its own
          // border, so the whole editor reads as a single input.
          border: readOnly ? 'none' : '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1.5,
          '.ql-toolbar.ql-snow': {
            border: 'none',
            borderBottom: '1px solid',
            borderColor: 'grey.300',
            pt: 1,
            px: 1.5,
            pb: 1
          },
          '.ql-container.ql-snow': {
            border: 'none',
            height,
            color: 'text.secondary',
            ...styles
          },
          '.ql-editor': {
            whiteSpace: 'pre-wrap', // Preserve multiple spaces and tabs
            padding: readOnly ? 0 : '12px 15px' // Read-only views (e.g. node labels) shouldn't reserve toolbar/tooltip clearance
          },
          '.ql-tooltip': {
            zIndex: 1000 // Ensure tooltips appear above content but don't obscure text
          }
        }}
      >
        <ReactQuill
          theme="snow"
          value={value ?? ''}
          readOnly={readOnly}
          onChange={onChange}
          formats={formats}
          modules={modules}
        />
      </Box>
    </DOMErrorBoundary>
  );
};
