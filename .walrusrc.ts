import { Config } from '@walrus/types';

const config: Config = {
  plugins: [
    './packages/plugin-release/src/index.ts'
  ],
  release: {
    mode: 'lerna'
  }
};

export default config;
