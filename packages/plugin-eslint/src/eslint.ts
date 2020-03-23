import { Api } from '@walrus/types';
import { CLIEngine } from 'eslint';
import { PluginEslintConfig } from './types';

const lint = (api: Api, args) => {
  const { lodash, chalk } = api.utils;
  const config = lodash.merge({}, api.config.lint, api.config.eslint);

  if (!('staged' in config)) {
    config.staged = true;
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
  const esIgnorer = api.createIgnorer(['**/*.ts', '**/*.js', '**/*.jsx', '**/*.tsx']);

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

  const cli = new CLIEngine({
    envs: ["browser"],
    useEslintrc: false,
    rules: {
      semi: 2
    }
  });

  console.log(changedFiles);

  const report = cli.executeOnFiles(changedFiles);

  const formatter = cli.getFormatter();

  console.log(formatter(report.results));
};

export default lint;
