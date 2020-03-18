import inquirer from 'inquirer';
import { Api, ReleasePluginConfig } from '@walrus/types';
import {
  exec,
  logStep,
  resolveLerna,
  confirmVersion,
  getNextVersion,
  printErrorAndExit
} from './utils';
import { Mode } from './types';
import lernaIndependentRelease from './release/lerna-independent';

const defaultConfig: ReleasePluginConfig = {
  skipBuild: false,
  skipPublish: false,
  skipGitStatusCheck: false
}

export default function(api: Api) {
  const { semver, isLernaPackage, execa, chalk } = api.utils;

  api.describe({
    key: 'release',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          skipBuild: joi.boolean(),
          skipPublish: joi.boolean(),
        });
      },
    }
  });

  function getCurrentVersion(
    mode: Mode = 'single'
  ) {
    let version = '';

    switch(mode) {
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

      // lerna 项目 确认是否转换发布类型
      if (isLernaPackage(api.cwd)) {
        const { yes } = await inquirer.prompt([{
          name: 'yes',
          message: `Whether to use lerna mode?`,
          type: 'confirm'
        }]);

        yes && (mode = 'lerna');
      }

      const currentVersion = getCurrentVersion(mode);

      // 发布项目不合法的一些情况
      if (
        mode === 'single' &&
        !skipPublish &&
        (api.pkg.private || !currentVersion)
      ) {
        printErrorAndExit(`单项目&开启发布，项目私有或者版本不存在`);
        return;
      }

      if (
        !(mode === 'lerna' && currentVersion === 'independent') &&
        !semver.valid(currentVersion)
      ) {
        printErrorAndExit(`多项目&同版本，版本不存在`);
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
        logStep(
          'git status check is skipped, since --skip-git-status-check is supplied',
        );
      }

      // Check npm registry
      logStep('check npm registry');
      const userRegistry = execa.sync('npm', ['config', 'get', 'registry']).stdout;
      if (userRegistry.includes('https://registry.yarnpkg.com/')) {
        printErrorAndExit(
          `Release failed, please use ${chalk.blue('npm run release')}.`,
        );
      }
      if (!userRegistry.includes('https://registry.npmjs.org/')) {
        const registry = chalk.blue('https://registry.npmjs.org/');
        printErrorAndExit(`Release failed, npm registry must be ${registry}.`);
      }

      // Build
      if (!newConfig.skipBuild) {
        logStep('build');
        await exec('npm', ['run', 'build']);
      } else {
        logStep('build is skipped, since args.skipBuild is supplied');
      }

      // lerna 独立版本发布
      if (mode === 'lerna' && currentVersion === 'independent') {
        lernaIndependentRelease(api.cwd, newConfig);
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
    }
  });
}
