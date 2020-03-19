import { join } from 'path';
import { writeFileSync } from 'fs';
import { chalk } from '@birman/utils';
import { ReleasePluginConfig } from '@walrus/types';
import { exec, logStep } from '../utils';


async function release(cwd: string, version: string, args: ReleasePluginConfig) {
  const pkgPath = join(cwd, 'package.json');

  // Sync version to package.json
  logStep('sync version to root package.json');
  const rootPkg = require(pkgPath);
  rootPkg.version = version;
  writeFileSync(
    join(pkgPath),
    JSON.stringify(rootPkg, null, 2) + '\n',
    'utf-8',
  );

  // Commit
  const commitMessage = `release: v${version}`;
  logStep(`git commit with ${chalk.blue(commitMessage)}`);
  await exec('git', ['commit', '--all', '--message', commitMessage]);

  // Git Tag
  logStep(`git tag v${version}`);
  await exec('git', ['tag', `v${version}`]);

  // Push
  logStep(`git push`);
  await exec('git', ['push', 'origin', 'master', '--tags']);


}

export default release;
