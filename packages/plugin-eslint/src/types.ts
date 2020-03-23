import { CLIEngine } from 'eslint';

export interface PluginEslintConfig extends CLIEngine.Options {
  since?: string;
  staged?: boolean;
  branch?: string;
  pattern?: string[];
}
