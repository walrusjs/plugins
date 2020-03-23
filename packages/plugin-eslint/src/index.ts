import { Api, PluginCommitLintConfig } from '@walrus/types';
import lint from './eslint';
import { PluginEslintConfig } from './types';

const defaultConfig: PluginCommitLintConfig = {};

export default function(api: Api) {
  api.describe({
    key: 'eslint',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({

        });
      },
    }
  });

  api.registerCommand({
    name: 'eslint',
    description: 'publish your project',
    fn: async ({ args }) => {
        lint(api, args);
    }
  })
}
