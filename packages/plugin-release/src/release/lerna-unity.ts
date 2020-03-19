import { join } from 'path';
import { writeFileSync } from 'fs';
import { execa, chalk } from '@birman/utils';
import { ReleasePluginConfig } from '@walrus/types';
import {
  exec,
  logStep,
  packageExists,
  getPackages,
  isNextVersion,
  getChangelog,
  getLernaUpdated,
  printErrorAndExit
} from '../utils';

const lernaCli = require.resolve('lerna/cli');

async function release(cwd: string, version: string, args: ReleasePluginConfig) {
  // get release notes
  logStep('get release notes');
  const releaseNotes = await getChangelog('');
  console.log(releaseNotes(''));

  // 获取更新的包
  const updated = getLernaUpdated(args.publishOnly);

  if (!updated.length) {
    printErrorAndExit('Release failed, no updated package is updated.');
  }

  // Clean
  logStep('clean');

  // Bump version
  logStep('bump version with lerna version');
  await exec(lernaCli, [
    'version',
    '--exact',
    '--no-commit-hooks',
    '--no-git-tag-version',
    '--no-push',
  ]);

  // Sync version to root package.json
  logStep('sync version to root package.json');
  const rootPkg = require(join(cwd, 'package.json'));
  Object.keys(rootPkg.devDependencies).forEach(name => {
    if (name.startsWith('@umijs/') && !name.startsWith('@umijs/p')) {
      rootPkg.devDependencies[name] = version;
    }
  });
  writeFileSync(
    join(__dirname, '..', 'package.json'),
    JSON.stringify(rootPkg, null, 2) + '\n',
    'utf-8',
  );


}

export default release;
