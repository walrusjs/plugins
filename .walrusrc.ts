import { Config } from '@walrus/types';

const config: Config = {
  plugins: [
    './packages/plugin-test/lib/index.js',
    './packages/plugin-release/lib/index.js'
  ],
  presets: ['./packages/preset-lint/lib/index.js']
};

export default config;
