import { join, dirname } from 'path';
import { CLIEngine } from 'eslint';
import deglob from 'deglob';
import { Api } from '@walrus/types';
import { HOME_OR_TMP, DEFAULT_IGNORE, DEFAULT_PATTERNS } from './config';

export interface LinterOptions {
  api?: Api;
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

class Linter {
  private cwd: string;
  private utils: Api['utils'];
  private customOpts: LinterOptions;
  private eslintConfig: CLIEngine.Options;

  constructor(opts: LinterOptions) {
    const { api } = opts;

    this.cwd = api.cwd || process.cwd();
    this.utils = api.utils;

    const m = opts.version && opts.version.match(/^(\d+)\./);
    const majorVersion = (m && m[1]) || '0';

    const cacheLocation = join(HOME_OR_TMP, `.${this.cwd}-v${majorVersion}-cache/`);

    this.eslintConfig = Object.assign(
      {
        cache: true,
        cacheLocation: cacheLocation,
        envs: [],
        fix: false,
        globals: [],
        ignore: false,
        plugins: [],
        useEslintrc: false
      },
      opts.eslintConfig
    );

    if (this.eslintConfig.configFile) {
      this.eslintConfig.resolvePluginsRelativeTo = dirname(this.eslintConfig.configFile);
    }

    this.customOpts = this.parseOpts(opts);
  }

  lintFiles = (files: string[]) => {
    const self = this;
    const { utils: { lodash, chalk } } = self;

    if (lodash.isString(files)) {
      files = [files];
    }
    if (files.length === 0) {
      files = DEFAULT_PATTERNS;
    }

    const deglobOpts = {
      ignore: this.customOpts.ignore,
      cwd: self.cwd,
      useGitIgnore: true,
      usePackageJson: false
    };

    deglob(files, deglobOpts, function(err, allFiles) {
      if (err) {
        console.log(chalk.red(err));
        process.exit(1);
      };

      let cli;
      let result;
      try {
        cli = new CLIEngine(self.customOpts.eslintConfig)
        result = cli.executeOnFiles(allFiles);
      } catch (err) {
        console.log(chalk.red(err));
        process.exit(1);
      }

      if (self.customOpts.fix) {
        CLIEngine.outputFixes(result);
      }

      if (cli && result) {
        const formatter = cli.getFormatter();
        console.log(formatter(result.results));
      }
    });
  }

  parseOpts = (opts: LinterOptions = {}) => {
    const self = this;
    const { utils: { lodash } } = self;

    opts = Object.assign({}, opts);
    opts.eslintConfig = Object.assign({}, self.eslintConfig);

    opts.eslintConfig.fix = !!opts.fix;

    // ignore
    if (!opts.ignore) opts.ignore = [];
    if (!opts.disabledDefaultIgnore) {
      addIgnore(DEFAULT_IGNORE);
    }

     // globals
    addGlobals(opts.globals);

    // plugins
    addPlugins(opts.plugins);

    // envs
    addEnvs(opts.envs);

    // parser
    setParser(opts.parser);

    // 添加忽略
    function addIgnore(ignore) {
      if (!ignore) return;
      opts.ignore = opts.ignore.concat(ignore);
    }

    // 添加global
    function addGlobals(globals) {
      if (!globals) return;
      opts.eslintConfig.globals = self.eslintConfig.globals.concat(globals);
    }

    // 添加插件
    function addPlugins(plugins) {
      if (!plugins) return;
      opts.eslintConfig.plugins = self.eslintConfig.plugins.concat(plugins);
    }

    // 添加Env
    function addEnvs(envs) {
      if (!envs) return;
      if (!lodash.isArray(envs) && !lodash.isString(envs)) {
        envs = Object.keys(envs).filter(function(env) {
          return envs[env];
        });
      }
      opts.eslintConfig.envs = self.eslintConfig.envs.concat(envs);
    }

    function setParser(parser) {
      if (!parser) return;
      opts.eslintConfig.parser = parser;
    }

    return opts;
  }
}

export default Linter;
