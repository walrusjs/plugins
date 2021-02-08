import { join } from 'path';
import { writeFileSync } from 'fs';
import { chalk } from '@walrus/utils';
import { exec, logStep, syncTNpm } from '../utils';
import { ReleasePluginConfig } from '../types';

export default async function (cwd: string, version: string, args: ReleasePluginConfig) {
  const pkgPath = join(cwd, 'package.json');

  /** 修改package.json版本 */
  logStep('sync version to root package.json');
  const rootPkg = require(pkgPath);
  rootPkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(rootPkg, null, 2) + '\n', 'utf-8');

  /** 提交代码 */
  const commitMessage = `chore(release): v${version}`;
  logStep(`git commit with ${chalk.blue(commitMessage)}`);
  await exec('git', ['commit', '--all', '--message', commitMessage]);

  /** 创建Tag */
  logStep(`git tag v${version}`);
  await exec('git', ['tag', `v${version}`]);

  /** 提交Tag */
  logStep(`git push tags`);
  await exec('git', ['push', 'origin', '--tags']);

  /** 提交代码到服务器端 */
  logStep(`git push`);
  await exec('git', ['push']);

  /** 发布到npm */
  if (!args.skipPublish) {
    logStep(`npm pulish`);
    // publish
    await exec('npm', ['publish']);
  } else {
    logStep('npm registryre check is skipped, since --skip-publish is supplied');
  }

  // 是否同步到淘宝源
  if (rootPkg.name && !args.skipSync) {
    logStep(`sync tnpm`);
    syncTNpm([rootPkg.name]);
  }

  logStep('done');
}
