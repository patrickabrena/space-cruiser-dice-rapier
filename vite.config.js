import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    base: './',
    esbuild: {
        target: "esnext",  // Allow top-level await
        supported: {
            'top-level-await': true,
        }
    }
});
