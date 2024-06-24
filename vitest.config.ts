import { defineConfig } from 'vite';

export default defineConfig( {
    test: {
        environment: 'jsdom'
        , server: {
            deps: {
                inline: [
                    'formularity-zod-adapter'
                ]
            }
        }
    }
} );
