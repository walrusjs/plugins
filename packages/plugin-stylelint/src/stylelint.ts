import { Api } from '@walrus/types';
import stylelint from 'stylelint';
import lintConfig from './stylelint.config.js';
import { PluginStylelintConfig, StylelintFlags } from './types';

const lint = (api: Api, args: StylelintFlags = {}) => {
  const { lodash, chalk } = api.utils;
  const config: PluginStylelintConfig = lodash.merge({}, api.config.lint, api.config.stylelint);

  if (!('staged' in config)) {
    config.staged = true;
  }

  if (args._ && args._.length) {
    config.files = args._;
  }

  const { staged, branch, since, pattern, files } = config;
  const currentDirectory = api.cwd;
  const scm = api.scm(currentDirectory);

  if (!scm) {
    throw new Error('Unable to detect a source control manager.');
  }

  const directory = scm.rootDirectory;
  const revision = since || scm.getSinceRevision(directory, { staged, branch });

  const rootIgnorer = api.createIgnorer(api.getIgnore(api.cwd));
  const cwdIgnorer =
    currentDirectory !== directory
      ? api.createIgnorer(api.getIgnore(currentDirectory))
      : () => true;

  const changedFiles = scm
    .getChangedFiles(directory, revision, staged)
    .filter(api.createMatcher(pattern))
    .filter(rootIgnorer)
    .filter(cwdIgnorer)
    .filter((item) => {
      return !api.createIgnorer(config.files)(item);
    });

  const unstagedFiles = staged
    ? scm
        .getUnstagedChangedFiles(directory)
        .filter(api.createMatcher(pattern))
        .filter(rootIgnorer)
        .filter(cwdIgnorer)
        .filter((item) => {
          return !api.createIgnorer(config.files)(item);
        })
    : [];

  const wasFullyStaged = (f) => unstagedFiles.indexOf(f) < 0;

  const newFiles = staged ? changedFiles : files;

  stylelint
    .lint({
      files: newFiles,
      config: lintConfig,
      ...args,
      formatter: 'string'
    })
    .then(function (data) {
      console.error(chalk.red(data.output));
    })
    .catch(function (err) {
      // do things with err e.g.
      console.error(chalk.red(err.stack));
    });
};

export default lint;
