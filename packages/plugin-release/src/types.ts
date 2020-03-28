export type Mode = 'lerna' | 'single';

export interface LernaInfo {
  version?: string;
  npmClient?: string;
  useWorkspaces?: boolean;
  ignoreChanges?: string[];
}

export interface ReleasePluginConfig {
  // 跳过编译
  skipBuild?: boolean;
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
  conventionalGraduate?: any;
  conventionalPrerelease?: any;
}
