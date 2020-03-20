import { Api } from '@walrus/types';
import { join } from 'path';
import { PluginPrettierConfig } from '@walrus/types';
import prettier from './prettier';

const defaultConfig: PluginPrettierConfig = {
  staged: true,
  config: join(__dirname, 'prettier.config.js')
};

export default function(api: Api) {
  const { chalk } = api.utils;

  api.describe({
    key: 'prettier',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          check: joi.boolean(),
          since: joi.string(),
          staged: joi.boolean(),
          config: joi.string(),
          // 在处理之前输出每个文件的名称
          verbose: joi.boolean(),
          // 是否重新暂存 与staged配合使用
          restage: joi.boolean(),
          bail: joi.boolean(),
          pattern: joi.array().items(joi.string())
        });
      }
    }
  });

  api.registerCommand({
    name: 'prettier',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      console.log(args);

      const prettyQuickResult = prettier(
        api,
        Object.assign(defaultConfig, api.config.prettier, args, {
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
          },
          onPartiallyStagedFile: (file) => {
            console.log(`✗ Found ${chalk.bold('partially')} staged file ${file}.`);
          },
          onWriteFile: (file) => {
            console.log(`✍️  Fixing up ${chalk.bold(file)}.`);
          },
          onCheckFile: (file, isFormatted) => {
            if (!isFormatted) {
              console.log(`⛔️  Check failed: ${chalk.bold(file)}`);
            }
          },
          onExamineFile: (file) => {
            console.log(`🔍  Examining ${chalk.bold(file)}.`);
          }
        })
      );

      if (prettyQuickResult.success) {
        console.log('✅  Everything is awesome!');
      } else {
        if (prettyQuickResult.errors.indexOf('PARTIALLY_STAGED_FILE') !== -1) {
          console.log(
            '✗ Partially staged files were fixed up.' +
              ` ${chalk.bold('Please update stage before committing')}.`
          );
        }
        if (prettyQuickResult.errors.indexOf('BAIL_ON_WRITE') !== -1) {
          console.log('✗ File had to be prettified and prettyQuick was set to bail mode.');
        }
        if (prettyQuickResult.errors.indexOf('CHECK_FAILED') !== -1) {
          console.log('✗ Code style issues found in the above file(s). Forgot to run Prettier?');
        }
        process.exit(1);
      }
    }
  });
}
