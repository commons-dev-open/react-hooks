import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: 'dist',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', '__tests__/**/*'],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        useDebounce: resolve(__dirname, 'src/hooks/useDebounce.ts'),
        useThrottle: resolve(__dirname, 'src/hooks/useThrottle.ts'),
        useLocalStorage: resolve(__dirname, 'src/hooks/useLocalStorage.ts'),
        useSessionStorage: resolve(__dirname, 'src/hooks/useSessionStorage.ts'),
        useCookie: resolve(__dirname, 'src/hooks/useCookie.ts'),
        useClickOutside: resolve(__dirname, 'src/hooks/useClickOutside.ts'),
        usePrevious: resolve(__dirname, 'src/hooks/usePrevious.ts'),
        useToggle: resolve(__dirname, 'src/hooks/useToggle.ts'),
        useTimeout: resolve(__dirname, 'src/hooks/useTimeout.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'esm.js' : 'cjs.js';
        return `${entryName}.${extension}`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        preserveModules: false,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});

