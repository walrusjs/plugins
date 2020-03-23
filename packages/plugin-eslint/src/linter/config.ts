import { homedir, tmpdir } from 'os';

export const HOME_OR_TMP = homedir() || tmpdir();

export const DEFAULT_PATTERNS = [
  '**/*.js',
  '**/*.jsx',
  '**/*.ts',
  '**/*.tsx',
  '**/*.mjs',
  '**/*.cjs'
];

// 默认忽略的文件
export const DEFAULT_IGNORE = [
  '**/*.min.js',
  'coverage/**',
  'node_modules/**',
  'vendor/**'
];
