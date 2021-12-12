import { Api } from '@walrus/types';
import { mergeConfig } from '@walrus/cli-utils';
import release, { Config } from '@walrus/release';

const defaultConfig: Config = {
  skipBuild: false,
  skipSync: true,
  skipPublish: false,
  skipGitStatusCheck: false,
  skipNpmRegistryCheck: false,
  commitMessage: `🔖 chore(release): publish %v`,
  buildCommand: 'build'
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
          skipNpmRegistryCheck: joi.boolean(),
          repoUrl: joi.string(),
          commitMessage: joi.string(),
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
      const newConfig = mergeConfig({}, api.config.release, args) as Config;

      await release(newConfig, api.pkg);
    }
  });
}
