export type Mode = 'lerna' | 'single';

export interface LernaInfo {
  version?: string;
  npmClient?: string;
  useWorkspaces?: boolean;
  ignoreChanges?: string[];
}

export interface ReleasePluginConfig {
  /** npm push --tag **** */
  tag?: string;
  /** 是否跳过编译 */
  skipBuild?: boolean;
  /** 是否跳过同步到淘宝源 */
  skipSync?: boolean;
  /** 是否跳过发布 */
  skipPublish?: boolean;
  /** 仓库地址 */
  repoUrl?: string;
  /** 仓库地址前缀 目前支持 github */
  repoUrlPrefix?: string;
  /** 是否跳过 Git 状态检查 */
  skipGitStatusCheck?: boolean;
  /** 是否跳过生成changelog */
  skipChangelog?: boolean;
  /** 仅发布，lerna模式有效 */
  publishOnly?: boolean;
  /** 指定编译命令 */
  buildCommand?: string;
  /** 指定提交的信息 */
  commitMessage?: string;
  conventionalGraduate?: any;
  conventionalPrerelease?: any;
}
