import { join } from 'path';
import { execa, chalk } from '@birman/utils';
import { ReleasePluginConfig } from '@walrus/types';
import {
  printErrorAndExit,
  logStep,
  packageExists,
  exec,
  getPackages,
  isNextVersion,
  getLernaUpdated
} from '../utils';

const lernaCli = require.resolve('lerna/cli');

async function release(cwd: string, args: ReleasePluginConfig) {

  // 获取更新的包
  const updated = getLernaUpdated(args.publishOnly);

  if (!updated.length) {
    printErrorAndExit('Release failed, no updated package is updated.');
  }

  // Clean
  logStep('clean');

  // Bump version
  // Commit
  // Git Tag
  // Push
  logStep('bump version with lerna version');

  const conventionalGraduate = args.conventionalGraduate
    ? ['--conventional-graduate'].concat(
        Array.isArray(args.conventionalGraduate)
          ? args.conventionalGraduate.join(',')
          : [],
      )
    : [];

  const conventionalPrerelease = args.conventionalPrerelease
    ? ['--conventional-prerelease'].concat(
        Array.isArray(args.conventionalPrerelease)
          ? args.conventionalPrerelease.join(',')
          : [],
      )
    : [];

  await exec(
    lernaCli,
    [
      'version',
      '--exact',
      '--message',
      'chore(release): Publish',
      '--conventional-commits',
    ]
      .concat(conventionalGraduate)
      .concat(conventionalPrerelease),
  );

  // Publish
  const pkgs = args.publishOnly ? getPackages(cwd) : updated;
  logStep(`publish packages: ${chalk.blue(pkgs.join(', '))}`);

  pkgs.forEach((pkg, index) => {
    const pkgPath = join(cwd, 'packages', pkg);
    const { name, version } = require(join(pkgPath, 'package.json'));
    const isNext = isNextVersion(version);
    let isPackageExist = null;
    if (args.publishOnly) {
      isPackageExist = packageExists({ name, version });
      if (isPackageExist) {
        console.log(
          `package ${name}@${version} is already exists on npm, skip.`,
        );
      }
    }
    if (!args.publishOnly || !isPackageExist) {
      console.log(
        `[${index + 1}/${pkgs.length}] Publish package ${name} ${
          isNext ? 'with next tag' : ''
        }`,
      );
      const cliArgs = isNext ? ['publish', '--tag', 'next'] : ['publish'];
      const { stdout } = execa.sync('npm', cliArgs, {
        cwd: pkgPath,
      });
      console.log(stdout);
    }
  });
}

export default release;