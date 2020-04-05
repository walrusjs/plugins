import { Api } from '@walrus/types';
import stylelint from 'stylelint';
import { scm as Scm, createIgnorer, getIgnore, createMatcher } from '@walrus/utils';
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
  const scm = Scm(currentDirectory);

  if (!scm) {
    throw new Error('Unable to detect a source control manager.');
  }

  const directory = scm.rootDirectory;
  const revision = since || scm.getSinceRevision(directory, { staged, branch });

  const rootIgnorer = createIgnorer(getIgnore(api.cwd) as any);
  const cwdIgnorer =
    currentDirectory !== directory ? createIgnorer(getIgnore(currentDirectory) as any) : () => true;

  const changedFiles = scm
    .getChangedFiles(directory, revision, staged)
    .filter(createMatcher(pattern))
    .filter(rootIgnorer)
    .filter(cwdIgnorer)
    .filter((item) => {
      return !createIgnorer(config.files)(item);
    });

  const unstagedFiles = staged
    ? scm
        .getUnstagedChangedFiles(directory)
        .filter(createMatcher(pattern))
        .filter(rootIgnorer)
        .filter(cwdIgnorer)
        .filter((item) => {
          return !createIgnorer(config.files)(item);
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
