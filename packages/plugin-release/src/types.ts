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
  // npm私有组织名称
  org?: string;
  // 跳过 Git 状态检查
  skipGitStatusCheck?: boolean;
  // 仅发布
  publishOnly?: boolean;
  // 跳过changelog
  skipChangelog?: boolean;
  conventionalGraduate?: any;
  conventionalPrerelease?: any;
}
