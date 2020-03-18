export type Mode = 'lerna' | 'single';

export interface LernaInfo {
  version?: string;
  npmClient?: string;
  useWorkspaces?: boolean;
  ignoreChanges?: string[];
}

export interface Args {
  skipGitStatusCheck?: boolean;
  publishOnly?: boolean;
  skipBuild?: boolean;
  conventionalGraduate?: any;
  conventionalPrerelease?: any;
}
