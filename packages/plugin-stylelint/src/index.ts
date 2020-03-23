import { Api } from '@walrus/types';
import stylelint from './stylelint';
import { PluginStylelintConfig } from './types';

const defaultConfig: PluginStylelintConfig = {
  files: []
};

export default function (api: Api) {
  api.describe({
    key: 'stylelint',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          since: joi.string(),
          staged: joi.boolean(),
          branch: joi.string(),
          pattern: joi.array().items(joi.string()),
          files: joi.array().items(joi.string()),
          fix: joi.boolean()
        });
      }
    }
  });

  api.registerCommand({
    name: 'stylelint',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      stylelint(api, args);
    }
  });
}
