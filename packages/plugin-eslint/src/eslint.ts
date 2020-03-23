import { join } from 'path';
import { Api } from '@walrus/types';
import Linter from './linter';
import { DEFAULT_PATTERNS } from './linter/config';

const eslint = (api: Api, args) => {
  const { lodash } = api.utils;
  const userConfig = lodash.merge({}, api.config.lint, api.config.eslint);

  if (!('staged' in userConfig)) {
    userConfig.staged = true;
  }

  const { staged, branch, since, pattern, ...otherConfig } = userConfig;
  const config = api.mergeConfig(otherConfig, args);

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
  const esIgnorer = api.createIgnorer(DEFAULT_PATTERNS);

  const changedFiles = scm
    .getChangedFiles(directory, revision, staged)
    .filter(api.createMatcher(pattern))
    .filter(rootIgnorer)
    .filter(cwdIgnorer)
    .filter((item) => !esIgnorer(item));

  const unstagedFiles = staged
    ? scm
        .getUnstagedChangedFiles(directory)
        .filter(api.createMatcher(pattern))
        .filter(rootIgnorer)
        .filter(cwdIgnorer)
        .filter((item) => !esIgnorer(item))
    : [];

  const wasFullyStaged = (f) => unstagedFiles.indexOf(f) < 0;

  const linter = new Linter({
    api,
    ...config,
    eslintConfig: {
      configFile: join(__dirname, './config/eslint.react-typescript.config.js')
    }
  });

  if (!staged) {
    linter.lintFiles(args._);
  } else {
    linter.lintFiles(changedFiles);
  }
};

export default eslint;
