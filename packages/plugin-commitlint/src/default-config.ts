import { join } from 'path';
import { PluginCommitLintConfig } from '@walrus/types';

const defaultOptions: PluginCommitLintConfig = {
  env: null,
  color: true,
  edit: false,
  from: null,
  to: null,
  config: join(__dirname, 'commitlint.config.js')
};

export default defaultOptions;
