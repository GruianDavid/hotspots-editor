import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/scss/common.scss',
                'resources/scss/sidebar.scss',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
    ],
});
