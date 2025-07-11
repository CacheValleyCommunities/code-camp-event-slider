import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
    // Load env file based on `mode` in the current directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '')

    return {
        server: {
            port: 3001,
            host: '0.0.0.0', // Allow connections from any host
            open: true
        },
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            // Generate source maps for better debugging
            sourcemap: true
        },
        publicDir: 'public',
        assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
        // Make environment variables available to client-side code
        define: {
            __APP_ENV__: JSON.stringify(env.APP_ENV)
        }
    }
})
