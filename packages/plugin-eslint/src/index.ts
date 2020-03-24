import { Api } from '@walrus/types';
import { join } from 'path';
import { existsSync } from 'fs';
import Linter from './linter';
import { PluginEslintConfig, RuleType } from './types';

const defaultConfig: PluginEslintConfig = {
  ruleType: 'typescript'
};

export default function(api: Api) {
  const { lodash } = api.utils;

  api.describe({
    key: 'eslint',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          ruleType: joi.string(),
          fix: joi.boolean(),
          configFile: joi.string(),
          ignorePattern: joi.array().items(joi.string()),
          maxWarnings: joi.number()
        });
      },
    }
  });

  function getEslintConfigFilePath(type: RuleType) {
    const fileName = `eslint${type === 'default' ? '' : '.' + type}.config.js`;

    return join(__dirname, `./config/${fileName}`);
  }

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
      const userConfig = lodash.merge({}, api.config.lint, api.config.eslint);
      const eslintConfigFilePath = getEslintConfigFilePath(userConfig.ruleType);

      if (!existsSync(eslintConfigFilePath)) {
        throw new Error('eslint config file not found.');
      }

      if (!('staged' in userConfig)) {
        userConfig.staged = true;
      }

      const config = api.mergeConfig(userConfig, args);

      const linter = new Linter({
        api,
        ...config,
        eslintConfig: {
          configFile: eslintConfigFilePath
        }
      }, args);

      linter.run();
    }
  })
}
