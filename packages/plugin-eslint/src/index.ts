import { Api } from '@walrus/types';
import lint from './eslint';

const defaultConfig = {};

export default function(api: Api) {
  api.describe({
    key: 'eslint',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          fix: joi.boolean(),
          configFile: joi.string(),
          ignorePattern: joi.array().items(joi.string()),
          maxWarnings: joi.number()
        });
      },
    }
  });

  api.registerCommand({
    name: 'eslint',
    description: 'publish your project',
    options: {
      '--config-file': 'Use this configuration, overriding .eslintrc.* config options if present',
      '--fix': 'Automatically fix problems',
      '--ignore-pattern': 'Pattern of files to ignore',
      '--max-warnings': 'Number of warnings to trigger nonzero exit code - default: -1'
    },
    fn: async ({ args }) => {
      lint(api, args);
    }
  })
}
