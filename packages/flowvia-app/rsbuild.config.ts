import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

const publicUrl = process.env.PUBLIC_URL || '';
const assetPrefix = publicUrl ? (publicUrl.endsWith('/') ? publicUrl : publicUrl + '/') : '/';

// Force a single resolved React instance. pnpm doesn't hoist react to the
// workspace root node_modules (only root package.json's own direct deps get
// hoisted there), so resolve via this package's own node_modules, which pnpm
// always symlinks to the single deduped copy in its store.
const localNodeModules = path.resolve(__dirname, 'node_modules');

export default defineConfig({
    plugins: [pluginReact()],
    resolve: {
        alias: {
            'react': path.join(localNodeModules, 'react'),
            'react-dom': path.join(localNodeModules, 'react-dom'),
        },
    },
    html: {
        template: './public/index.html',
        templateParameters: {
            assetPrefix: assetPrefix,
        },
    },
    source: {
        // Define global constants that will be replaced at build time
        define: {
            'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        },
    },
    output: {
        distPath: {
            root: 'build',
        },
        // https://rsbuild.rs/guide/advanced/browser-compatibility
        polyfill: 'usage',
        assetPrefix: assetPrefix,
    }
});
