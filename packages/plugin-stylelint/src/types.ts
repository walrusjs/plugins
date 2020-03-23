type Formatter = 'compact' | 'json' | 'string' | 'unix' | 'verbose';

type Syntax = 'css' | 'css-in-js' | 'html' | 'less' | 'markdown' | 'sass' | 'scss' | 'sugarss';

export interface StylelintFlags {
  _?: string[];
  fix?: boolean;
  code?: string;
  cache?: boolean;
  syntax?: Syntax;
  formatter?: Formatter;
  disableDefaultIgnores?: boolean;
  ignorePath?: string;
  config?: {
    extends?: string | string[];
    plugins?: string[];
    rules?: {
      [key: string]: any;
    };
    ignoreFiles?: string[];
  };
  configFile?: string;
}

export interface PluginStylelintConfig {
  since?: string;
  staged?: boolean;
  branch?: string;
  pattern?: string[];

  // Stylelint 使用
  files?: string[];
  fix?: boolean;
}
