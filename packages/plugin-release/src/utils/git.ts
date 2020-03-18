import { execa } from '@birman/utils';

export const latestTag = async () => {
  const { stdout } = await execa('git', ['describe', '--abbrev=0', '--tags']);
  return stdout;
};

export const firstCommit = async () => {
  const { stdout } = await execa('git', [
    'rev-list',
    '--max-parents=0',
    'HEAD',
  ]);
  return stdout;
};

export const latestTagOrFirstCommit = async () => {
  let latest;
  try {
    // In case a previous tag exists, we use it to compare the current repo status to.
    latest = await exports.latestTag();
  } catch (_) {
    // Otherwise, we fallback to using the first commit for comparison.
    latest = await firstCommit();
  }

  return latest;
};

export const commitLogFromRevision = async revision => {
  const { stdout } = await execa('git', [
    'log',
    '--format=%s %h',
    `${revision}..HEAD`,
  ]);
  return stdout;
};
