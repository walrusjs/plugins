import { join } from 'path';
import { execa, chalk } from '@walrus/utils';
import { exec, logStep, isNextVersion, printErrorAndExit, syncTNpm } from '../utils';
import { ReleasePluginConfig } from '../types';

const lernaCli = require.resolve('lerna/cli');
const open = require('open');
const { getPackages } = require('@lerna/project');
const newGithubReleaseUrl = require('new-github-release-url');

async function release(
  cwd: string,
  currVersion: string,
  releaseNotes: any,
  args: ReleasePluginConfig
) {
  let updated = null;

  logStep('check updated packages');
  const updatedStdout = execa.sync(lernaCli, ['changed']).stdout;
  updated = updatedStdout
    .split('\n')
    .map((pkg) => {
      return pkg.split('/')[1];
    })
    .filter(Boolean);
  if (!updated.length) {
    printErrorAndExit('Release failed, no updated package is updated.');
  }

  // Bump version
  logStep('bump version with lerna version');
  await exec(lernaCli, [
    'version',
    currVersion,
    '--exact',
    '--no-commit-hooks',
    '--no-git-tag-version',
    '--no-push'
  ]);

  // Commit
  const commitMessage = `chore(release): v${currVersion}`;
  logStep(`git commit with ${chalk.blue(commitMessage)}`);
  await exec('git', ['commit', '--all', '--message', commitMessage]);

  // Git Tag
  logStep(`git tag v${currVersion}`);
  await exec('git', ['tag', `v${currVersion}`]);

  // Push
  logStep(`git push`);
  await exec('git', ['push', 'origin', '--tags']);

  const isNext = isNextVersion(currVersion);

  if (!args.skipPublish) {
    const pkgs = getPackages(cwd);
    logStep(`publish packages: ${chalk.blue(pkgs.join(', '))}`);

    pkgs.forEach((pkg, index) => {
      const { name, version, contents: pkgPath } = pkg;
      if (version === currVersion) {
        console.log(
          `[${index + 1}/${pkgs.length}] Publish package ${name} ${isNext ? 'with next tag' : ''}`
        );
        const cliArgs = isNext ? ['publish', '--tag', 'next'] : ['publish'];
        const { stdout } = execa.sync('npm', cliArgs, {
          cwd: pkgPath
        });
        console.log(stdout);
      }
    });

    if (!args.skipSync) {
      logStep(`sync tnpm`);

      const pkgNames = pkgs
        .map((name) => require(join(__dirname, '../packages', name, 'package.json')).name)
        .filter((item) => item);

      syncTNpm(pkgNames);
    }
  }

  if (releaseNotes && args.repoUrlPrefix && args.repoUrl) {
    logStep('create github release');
    const tag = `v${currVersion}`;
    const changelog = releaseNotes(tag);
    console.log(changelog);
    const url = newGithubReleaseUrl({
      repoUrl: args.repoUrlPrefix + args.repoUrl,
      tag,
      body: changelog,
      isPrerelease: isNext
    });
    await open(url);
  }

  logStep('done');
}

export default release;
