import { join } from 'path';
import { execa, chalk } from '@walrus/utils';
import {
  printErrorAndExit,
  logStep,
  packageExists,
  exec,
  syncTNpm,
  isNextVersion,
  getLernaUpdated
} from '../utils';
import { ReleasePluginConfig } from '../types';

const { getPackages } = require('@lerna/project');
const lernaCli = require.resolve('lerna/cli');

export default async function release(
  cwd: string,
  options: ReleasePluginConfig
) {
  /** 获取更新的包 */
  const updated = getLernaUpdated(options.publishOnly) ?? [];
  if (!updated.length) {
    printErrorAndExit('Release failed, no updated package is updated.');
    return;
  }

  logStep('bump version with lerna version');

  const conventionalGraduate = options.conventionalGraduate
    ? ['--conventional-graduate'].concat(
        Array.isArray(options.conventionalGraduate) ? options.conventionalGraduate.join(',') : []
      )
    : [];

  const conventionalPrerelease = options.conventionalPrerelease
    ? ['--conventional-prerelease'].concat(
        Array.isArray(options.conventionalPrerelease) ? options.conventionalPrerelease.join(',') : []
      )
    : [];

  await exec(
    lernaCli,
    ['version', '--exact', '--message', 'chore(release): Publish', '--conventional-commits']
      .concat(conventionalGraduate)
      .concat(conventionalPrerelease)
  );

  if (!options.skipPublish) {
    let pkgs = await getPackages(cwd);
    if (!options.publishOnly) {
      pkgs = pkgs.filter(item => updated.includes(item.name))
    }
    logStep(`publish packages: ${chalk.blue(pkgs.join(', '))}`);

    pkgs.forEach((pkg, index) => {
      const { name, version, contents: pkgPath } = pkg;
      if (name && version) {
        const isNext = isNextVersion(version);
        let isPackageExist = null;
        if (options.publishOnly) {
          isPackageExist = packageExists({ name, version });
          if (isPackageExist) {
            console.log(`package ${name}@${version} is already exists on npm, skip.`);
          }
        }
        if (!options.publishOnly || !isPackageExist) {
          console.log(
            `[${index + 1}/${pkgs.length}] Publish package ${name} ${isNext ? 'with next tag' : ''}`
          );
          const cliArgs = isNext ? ['publish', '--tag', 'next'] : ['publish'];
          const { stdout } = execa.sync('npm', cliArgs, {
            cwd: pkgPath
          });
          console.log(stdout);
        }
      }
    });

    if (!options.skipSync) {
      logStep(`sync tnpm`);

      const pkgNames = pkgs
        .map((pkg) => pkg.name)
        .filter((item) => item);

      syncTNpm(pkgNames);
    }
  }

  logStep('done');
}
