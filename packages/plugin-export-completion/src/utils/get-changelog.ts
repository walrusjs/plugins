import { htmlEscape } from 'escape-goat';
import { latestTagOrFirstCommit, commitLogFromRevision } from './git';

const getChangelog = async (repoUrl: string) => {
  const latest = await latestTagOrFirstCommit();
  const log = await commitLogFromRevision(latest);

  if (!log) {
    throw new Error(`get changelog failed, no new commits was found.`);
  }

  const commits = log.split('\n').map(commit => {
    const splitIndex = commit.lastIndexOf(' ');
    return {
      message: commit.slice(0, splitIndex),
      id: commit.slice(splitIndex + 1),
    };
  });

  return nextTag =>
    commits
      .map(commit => `- ${htmlEscape(commit.message)}  ${commit.id}`)
      .join('\n') + `\n\n${repoUrl}/compare/${latest}...${nextTag}`;
};

export default getChangelog;
