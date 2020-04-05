import { Api } from '@walrus/types';
import { PluginPrettierConfig } from './types';
import { processFiles, isSupportedExtension } from './utils';

/**
 * 美化程序封装
 * @param currentDirectory 当前目录
 * @param options 配置参数
 */
const prettier = (api: Api, options: PluginPrettierConfig = {}) => {
  const currentDirectory = api.cwd;
  const scm = api.scm(currentDirectory);
  const {
    staged,
    branch,
    since,
    check,
    config,
    bail,
    verbose,
    restage = true,
    onCheckFile,
    onWriteFile,
    onExamineFile,
    onPartiallyStagedFile,
    onFoundSinceRevision,
    onFoundChangedFiles,
    pattern
  } = options;

  if (!scm) {
    throw new Error('Unable to detect a source control manager.');
  }
  const directory = scm.rootDirectory;
  const revision = since || scm.getSinceRevision(directory, { staged, branch });

  onFoundSinceRevision && onFoundSinceRevision(scm.name, revision);

  const rootIgnorer = api.createIgnorer(api.getIgnore(api.cwd));
  const cwdIgnorer =
    currentDirectory !== directory
      ? api.createIgnorer(api.getIgnore(currentDirectory))
      : () => true;

  const changedFiles = scm
    .getChangedFiles(directory, revision, staged)
    .filter(isSupportedExtension)
    .filter(api.createMatcher(pattern))
    .filter(rootIgnorer)
    .filter(cwdIgnorer);

  const unstagedFiles = staged
    ? scm
        .getUnstagedChangedFiles(directory)
        .filter(isSupportedExtension)
        .filter(api.createMatcher(pattern))
        .filter(rootIgnorer)
        .filter(cwdIgnorer)
    : [];

  const wasFullyStaged = (f) => unstagedFiles.indexOf(f) < 0;

  onFoundChangedFiles && onFoundChangedFiles(changedFiles);

  const failReasons = new Set();

  processFiles(directory, changedFiles, {
    check,
    config,
    onWriteFile: (file) => {
      onWriteFile && onWriteFile(file);
      if (bail) {
        failReasons.add('BAIL_ON_WRITE');
      }
      if (staged && restage) {
        if (wasFullyStaged(file)) {
          scm.stageFile(directory, file);
        } else {
          onPartiallyStagedFile && onPartiallyStagedFile(file);
          failReasons.add('PARTIALLY_STAGED_FILE');
        }
      }
    },
    onCheckFile: (file, isFormatted) => {
      onCheckFile && onCheckFile(file, isFormatted);
      if (!isFormatted) {
        failReasons.add('CHECK_FAILED');
      }
    },
    onExamineFile: verbose && onExamineFile
  });

  return {
    success: failReasons.size === 0,
    errors: Array.from(failReasons)
  };
};

export default prettier;
