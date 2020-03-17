import { join } from 'path';
import { Api } from '@walrus/types';
import { ReleasePluginConfig } from '@walrus/types';
import inquirer from 'inquirer';
import { LernaInfo } from './types';

const defaultConfig: ReleasePluginConfig = {
  mode: 'single',
  publish: true
}

const bumps = ['patch', 'minor', 'major', 'prerelease'];

export default function(api: Api) {

  const { semver, isLernaPackage } = api.utils;

  api.describe({
    key: 'release',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          mode: joi.string()
        });
      },
    }
  });

  async function getNextVersion(currentVersion: string) {
    const versions = {};
    bumps.forEach(b => { versions[b] = semver.inc(currentVersion, b as any) });

    const bumpChoices = bumps.map(b => ({ name: `${b} (${versions[b]})`, value: b }));

    const { bump, customVersion } = await inquirer.prompt([
      {
        name: 'bump',
        message: 'Select release type:',
        type: 'list',
        choices: [
          ...bumpChoices,
          { name: 'custom', value: 'custom' }
        ]
      },
      {
        name: 'customVersion',
        message: 'Input version:',
        type: 'input',
        when: answers => answers.bump === 'custom'
      }
    ]);

    return customVersion || versions[bump];
  }

  async function confirmVersion(version: string) {
    const { yes } = await inquirer.prompt([{
      name: 'yes',
      message: `Confirm releasing ${version}?`,
      type: 'confirm'
    }]);

    return yes;
  }

  /**
   * 获取lerna.json
   * @param cwd
   */
  function resolveLerna(cwd: string): LernaInfo {
    try {
      return require(join(cwd, 'lerna.json'));
    } catch (e) {
      return {};
    }
  }

  function getCurrentVersion(
    mode: ReleasePluginConfig['mode'] = 'single'
  ) {
    let version = '';
    const lernaInfo = resolveLerna(api.cwd);

    switch(mode) {
      case 'single':
        version = api.pkg.version;
      case 'lerna':
        version = lernaInfo.version;
    }

    return version || '';
  }

  api.registerCommand({
    name: 'release',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      const { mode = 'single', publish } = api.config.release;

      // 检查 mode=lerna 下是否为 lerna 项目
      if (mode === 'lerna' && !isLernaPackage(api.cwd)) {
        console.error(`非lerna项目，配置错误`);
        return;
      }

      const currentVersion = getCurrentVersion(mode);

      // 发布项目不合法的一些情况
      if (
        mode === 'single' &&
        publish &&
        (api.pkg.private || !currentVersion)
      ) {
        console.error(`配置不合法，项目无法发布`);
        return;
      }

      console.log(currentVersion);

      if (
        !(mode === 'lerna' && currentVersion === 'independent') &&
        !semver.valid(currentVersion)
      ) {
        console.error(`无法获取当前版本，或版本不合法`);
        return;
      }

      if (currentVersion === 'independent') {
        console.log('请选择需要发布的子包');
        return;
      }

      // 1. 获取需要发布的版本
      // 获取下一个需要发布的版本
      const version = await getNextVersion(currentVersion);

      // 检验版本是否合法
      if (!semver.valid(version)) {
        console.log(`输入的版本(${version})格式不合法`);
        return;
      }

      // 版本二次确认
      const result = await confirmVersion(version);
      if (!result) return;

      console.log(version);
      // 2. 更新 package.json

      // 3. 提交代码

      // 4.
    }
  });
}
