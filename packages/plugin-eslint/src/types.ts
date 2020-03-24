import { CLIEngine } from 'eslint';

export type RuleType = 'default' | 'react-typescript' | 'react' | 'typescript' | 'vue';

export interface PluginEslintConfig {
  ruleType?: RuleType;
  since?: string;
  staged?: boolean;
  branch?: string;
  pattern?: string[];
  // 是否开启自动修复
  fix?: boolean;
  version?: string;
  eslintConfig?: CLIEngine.Options;
  // 需要忽略的文件
  envs?: string[];
  ignore?: string[];
  globals?: string[];
  plugins?: string[];
  parser?: string;
  disabledDefaultIgnore?: boolean;
}
