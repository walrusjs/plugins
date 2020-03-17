import { Api } from '@walrus/types';
import { PluginConfig } from './types';
import inquirer from 'inquirer';

const defaultConfig: PluginConfig = {
  mode: 'single'
}

const bumps = ['patch', 'minor', 'major', 'prerelease'];

export default function(api: Api) {

  const { semver } = api.utils;

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

  api.registerCommand({
    name: 'release',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      // 1. 获取需要发布的版本
      // 获取package.json中的版本
      const currentVersion: string = api.pkg.version || '';

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
    }
  });
}
