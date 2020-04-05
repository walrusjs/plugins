import { Api } from '@walrus/types';
import { chalk, lodash } from '@walrus/utils';
import { join } from 'path';
import { existsSync } from 'fs';
import Linter from './linter';
import { PluginEslintConfig, RuleType } from './types';

const defaultConfig: PluginEslintConfig = {
  ruleType: 'typescript',
  fix: true
};

export default function (api: Api) {
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
      }
    }
  });

  function getEslintConfigFilePath(type: RuleType = 'default') {
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

      const linter = new Linter(
        {
          api,
          ...config,
          eslintConfig: {
            configFile: eslintConfigFilePath
          },
          onWriteFile: (file) => {
            console.log(`✍️  Fixing up ${chalk.bold(file)}.`);
          },
          onFoundSinceRevision: (scm, revision) => {
            console.log(
              `🔍  Finding changed files since ${chalk.bold(scm)} revision ${chalk.bold(revision)}.`
            );
          },
          onFoundChangedFiles: (changedFiles) => {
            console.log(
              `🎯  Found ${chalk.bold(changedFiles.length)} changed ${
                changedFiles.length === 1 ? 'file' : 'files'
              }.`
            );
          }
        },
        args
      );

      linter.run();
    }
  });
}
