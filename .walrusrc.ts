import { Config } from '@walrus/types';

const config: Config = {
  plugins: ['./packages/plugin-release/lib/index.js'],
  presets: ['./packages/preset-lint/lib/index.js']
};

export default config;
