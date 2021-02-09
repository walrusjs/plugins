export type Mode = 'lerna' | 'single';

export interface LernaInfo {
  version?: string;
  npmClient?: string;
  useWorkspaces?: boolean;
  ignoreChanges?: string[];
}

export interface ReleasePluginConfig {
  /** npm push --tag="****" */
  tag?: string;
  // 跳过编译
  skipBuild?: boolean;
  // 是否跳过同步到淘宝源
  skipSync?: boolean;
  // 跳过发布
  skipPublish?: boolean;
  // 仓库地址
  repoUrl?: string;
  // 仓库地址前缀 目前支持 github
  repoUrlPrefix?: string;
  // 跳过 Git 状态检查
  skipGitStatusCheck?: boolean;
  // 跳过changelog
  skipChangelog?: boolean;
  publishOnly?: boolean;
  // 编译命令
  buildCommand?: string;
  conventionalGraduate?: any;
  conventionalPrerelease?: any;
}
