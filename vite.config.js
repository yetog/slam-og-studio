import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    base: '/slam-og-studio/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@core': path.resolve(__dirname, './src/core'),
            '@ui': path.resolve(__dirname, './src/ui'),
            '@effects': path.resolve(__dirname, './src/effects'),
            '@instruments': path.resolve(__dirname, './src/instruments'),
        },
    },
    server: {
        port: 3021,
        headers: {
            // Required for AudioWorklet and SharedArrayBuffer
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    blueprint: ['@blueprintjs/core', '@blueprintjs/icons'],
                },
            },
        },
    },
});
