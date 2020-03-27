import inquirer from 'inquirer';
import { Api } from '@walrus/types';
import {
  exec,
  logStep,
  resolveLerna,
  getChangelog,
  confirmVersion,
  getNextVersion,
  printErrorAndExit
} from './utils';
import { lernaIndependent, lernaUnity, single } from './release';
import { Mode, ReleasePluginConfig } from './types';

const defaultConfig: ReleasePluginConfig = {
  skipBuild: false,
  skipPublish: false,
  skipGitStatusCheck: false,
  repoUrlPrefix: 'https://github.com/'
};

export default function (api: Api) {
  const { semver, isLernaPackage, execa, chalk } = api.utils;

  api.describe({
    key: 'release',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          skipBuild: joi.boolean(),
          skipPublish: joi.boolean(),
          repoUrl: joi.string(),
          skipChangelog: joi.string(),
          repoUrlPrefix: joi.string(),
          skipGitStatusCheck: joi.boolean()
        });
      }
    }
  });

  function getCurrentVersion(mode: Mode = 'single') {
    let version = '';

    switch (mode) {
      case 'single':
        version = api.pkg.version;
        break;
      case 'lerna':
        version = resolveLerna(api.cwd).version;
        break;
    }

    return version || '';
  }

  api.registerCommand({
    name: 'release',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      logStep('start');
      let mode: Mode = 'single';

      // 合并命令行中的配置
      // 命令行配置优先级最高
      const newConfig = Object.assign({}, api.config.release, args);
      const { skipPublish } = newConfig;

      // 修改发布模式
      if (isLernaPackage(api.cwd)) {
        mode = 'lerna';
      }

      const currentVersion = getCurrentVersion(mode);

      // 发布项目不合法的一些情况
      if (mode === 'single' && !skipPublish && (api.pkg.private || !currentVersion)) {
        printErrorAndExit(`单包项目&跳过发布&(项目私有或者版本不存在)`);
        return;
      }

      if (
        !(mode === 'lerna' && currentVersion === 'independent') &&
        !semver.valid(currentVersion)
      ) {
        printErrorAndExit(`多包项目&同版本&版本不存在`);
        return;
      }

      // Check git status
      if (!newConfig.skipGitStatusCheck) {
        logStep('check git status');
        const gitStatus = execa.sync('git', ['status', '--porcelain']).stdout;
        if (gitStatus.length) {
          printErrorAndExit(`Your git status is not clean. Aborting.`);
        }
      } else {
        logStep('git status check is skipped, since --skip-git-status-check is supplied');
      }

      if (!newConfig.skipPublish) {
        // Check npm registryre
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

      // Build
      if (!newConfig.skipBuild) {
        logStep('build');
        await exec('npm', ['run', 'build']);
      } else {
        logStep('build is skipped, since --skip-build is supplied');
      }

      // lerna 独立版本发布
      if (mode === 'lerna' && currentVersion === 'independent') {
        lernaIndependent(api.cwd, newConfig);
        return;
      }

      // lerna 统一版本发布 或 单个库发布

      // 获取下一个需要发布的版本
      const version = await getNextVersion(currentVersion);

      // 检验版本是否合法
      if (!semver.valid(version)) {
        printErrorAndExit(`输入的版本(${version})格式不合法`);
        return;
      }

      // 版本二次确认
      const result = await confirmVersion(version);
      if (!result) return;

      let releaseNotes;

      // 获取changelog信息
      if (newConfig.repoUrlPrefix && newConfig.repoUrl) {
        // get release notes
        logStep('get release notes');
        releaseNotes = await getChangelog(newConfig.repoUrlPrefix + newConfig.repoUrl);
        console.log(releaseNotes(''));
      }

      if (mode === 'lerna') {
        lernaUnity(api.cwd, version, releaseNotes, newConfig);
        return;
      }

      single(api.cwd, version, newConfig);
    }
  });
}
