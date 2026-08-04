import React from 'react';
import { GlobalStyles as MUIGlobalStyles } from '@mui/material';
import 'react-quill-new/dist/quill.snow.css';

export const GlobalStyles = () => {
  return (
    <MUIGlobalStyles
      styles={{
        div: {
          boxSizing: 'border-box'
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.22) transparent'
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          borderRadius: 8,
          border: '2px solid transparent',
          backgroundClip: 'padding-box'
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        '*::-webkit-scrollbar-corner': {
          background: 'transparent'
        },
        // Drives the connector flow-direction dot (see Connector.tsx). CSS
        // animation-delay reliably supports negative values for phase sync
        // across elements with the same duration — SVG SMIL (animateMotion)
        // doesn't honor that consistently, which is why this isn't SMIL.
        '@keyframes isenax-flow-motion': {
          from: { offsetDistance: '0%' },
          to: { offsetDistance: '100%' }
        }
      }}
    />
  );
};
