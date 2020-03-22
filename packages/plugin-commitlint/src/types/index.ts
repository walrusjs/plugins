import { UserConfig } from './load';

export * from './rules';
export * from './load';
export * from './parse';

export interface Flags {
  to?: string;
  cwd?: string;
  env?: string;
  edit?: string;
  color?: boolean;
  from?: string;
  config?: string;
  quiet?: boolean;
  format?: string;
  // 启动详细输出
  verbose?: boolean;
  helpUrl?: string;
}
