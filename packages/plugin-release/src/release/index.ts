import { semver, execa, chalk } from '@walrus/utils';
import { PackageJson } from '@pansy/types';
import single from './single';
import lernaUnity from './lerna-unity';
import lernaIndependent from './lerna-independent';
import {
  exec,
  logStep,
  resolveLerna,
  getChangelog,
  confirmVersion,
  getNextVersion,
  printErrorAndExit
} from '../utils';
import { Mode, ReleasePluginConfig } from '../types';

async function release({ pkg, cwd, mode, options }: {
  cwd: string,
  mode: Mode,
  pkg: PackageJson,
  options: ReleasePluginConfig
}) {
  logStep('start');

  /** 获取当前版本 */
  const currentVersion = getCurrentVersion(mode);

  /** 单项目不合法检查 */
  if (mode === 'single' && !options.skipPublish) {
    if (pkg.private) {
      printErrorAndExit('私有项目不允许发布，可设置--skip-publish跳过发布');
      return;
    }

    if (!currentVersion || !semver.valid(currentVersion)) {
      printErrorAndExit('package.json version 字段不存在或不合法');
      return;
    }

    if (!pkg.name) {
      printErrorAndExit('package.json name 字段不存在');
      return;
    }

    if (pkg.name.charAt(0) === '@' && pkg.publishConfig?.access !== 'public') {
      printErrorAndExit('未设置 publishConfig.access 为 public');
      return;
    }
  }

  if (
    !(mode === 'lerna' && currentVersion === 'independent') &&
    !semver.valid(currentVersion)
  ) {
    printErrorAndExit(`lerna.json version 不存在或不合法`);
    return;
  }

  /** 检查Git状态，是否存在未提交的文件 */
  if (!options.skipGitStatusCheck) {
    logStep('check git status');
    const gitStatus = execa.sync('git', ['status', '--porcelain']).stdout;
    if (gitStatus.length) {
      printErrorAndExit(`Your git status is not clean. Aborting.`);
    }
  } else {
    logStep('git status check is skipped, since --skip-git-status-check is supplied');
  }

  /** 检查 npm registry 地址 */
  if (!options.skipPublish) {
    logStep('check npm registry');
    const userRegistry = execa.sync('npm', ['config', 'get', 'registry']).stdout;
    if (userRegistry.includes('https://registry.yarnpkg.com/')) {
      printErrorAndExit(`Release failed, please use ${chalk.blue('npm run release')}.`);
    }
    if (!userRegistry.includes('https://registry.npmjs.org/')) {
      const registry = chalk.blue('https://registry.npmjs.org/');
      printErrorAndExit(`Release failed, npm registry must be ${registry}.`);
    }
  } else {
    logStep('npm registryre check is skipped, since --skip-publish is supplied');
  }

  /** 执行项目编译 */
  if (!options.skipBuild) {
    logStep('build');
    await exec('npm', ['run', options.buildCommand ?? 'build']);
  } else {
    logStep('build is skipped, since --skip-build is supplied');
  }

  /** lerna 独立版本发布 */
  if (mode === 'lerna' && currentVersion === 'independent') {
    lernaIndependent(cwd, options);
    return;
  }

  /** 获取下一个需要发布的版本 */
  const version = await getNextVersion(currentVersion);

  /** 检验版本是否合法 */
  if (!semver.valid(version)) {
    printErrorAndExit(`输入的版本(${version})格式不合法`);
    return;
  }

  /** 版本二次确认 */
  const result = await confirmVersion(version);
  if (!result) return;

  let releaseNotes;

  // 获取changelog信息
  if (options.repoUrlPrefix && options.repoUrl) {
    // get release notes
    logStep('get release notes');
    releaseNotes = await getChangelog(options.repoUrlPrefix + options.repoUrl);
    console.log(releaseNotes(''));
  }

  if (mode === 'lerna') {
    lernaUnity(cwd, version, releaseNotes, options);
    return;
  }

  single(cwd, version, options);


  // ------------- functions -------------

  function getCurrentVersion(mode: Mode = 'single') {
    let version = '';

    switch (mode) {
      case 'single':
        version = pkg.version;
        break;
      case 'lerna':
        version = resolveLerna(cwd).version;
        break;
    }

    return version || '';
  }
}

export default release;
