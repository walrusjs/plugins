import { Config } from '@walrus/types';

const config: Config = {
  plugins: [
    './packages/plugin-release/lib/index.js'
  ],
  release: {}
};

export default config;
