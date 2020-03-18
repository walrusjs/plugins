export type Mode = 'lerna' | 'single';

export interface LernaInfo {
  version?: string;
  npmClient?: string;
  useWorkspaces?: boolean;
  ignoreChanges?: string[];
}
