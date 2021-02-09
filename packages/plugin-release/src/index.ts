import { Api } from '@walrus/types';
import { isLernaPackage } from '@walrus/utils';
import release from './release';
import { Mode, ReleasePluginConfig } from './types';

const defaultConfig: ReleasePluginConfig = {
  skipBuild: false,
  skipSync: true,
  skipPublish: false,
  skipGitStatusCheck: false,
  buildCommand: 'build',
  repoUrlPrefix: 'https://github.com/'
};

export default function (api: Api) {
  api.describe({
    key: 'release',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          tag: joi.string(),
          skipBuild: joi.boolean(),
          skipSync: joi.boolean(),
          skipPublish: joi.boolean(),
          repoUrl: joi.string(),
          skipChangelog: joi.string(),
          repoUrlPrefix: joi.string(),
          buildCommand: joi.string(),
          skipGitStatusCheck: joi.boolean()
        });
      }
    }
  });

  api.registerCommand({
    name: 'release',
    alias: 'r',
    description: 'publish your project to npm',
    fn: async ({ args }) => {
      /**
       * 获取最终配置
       * 命令行配置优先级最高
       */
      const newConfig = Object.assign({}, api.config.release, args);

      /** 获取发布模式 */
      let mode: Mode = 'single';
      if (isLernaPackage(api.cwd)) {
        mode = 'lerna';
      }

      await release({
        cwd: api.cwd,
        mode,
        pkg: api.pkg,
        options: newConfig
      });
    }
  });
}
