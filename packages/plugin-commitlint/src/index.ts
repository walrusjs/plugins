import { join } from 'path';
import { Api } from '@walrus/types';
import commitLint from './commitlint';
import { Flags } from './types';

const pkg = require('../package.json');

const defaultConfig: Flags = {
  env: null,
  color: true,
  from: null,
  to: null,
  config: join(__dirname, 'commitlint.config.js')
};

export default function(api: Api) {
  api.describe({
    key: 'commitlint',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          color: joi.boolean(),
          config: joi.string(),
          edit: joi.string(),
          env: joi.string(),
          from: joi.string(),
          format: joi.string(),
          quiet: joi.boolean(),
          to: joi.string(),
          verbose: joi.boolean()
        });
      }
    }
  });

  api.registerCommand({
    name: 'commitlint',
    description: 'Lint your commit messages',
    options: {
      '--color': 'toggle colored output',
      '--config': 'path to the config file',
      '--edit':
        'read last commit message from the specified file or fallbacks to ./.git/COMMIT_EDITMSG',
      '--env': 'check message in the file at path given by environment variable value',
      '--from': 'lower end of the commit range to lint; applies if edit=false',
      '--format': 'output format of the results',
      '--quiet': 'toggle console output',
      '--to': 'upper end of the commit range to lint; applies if edit=false',
      '--verbose': 'enable verbose output for reports without problems'
    },
    fn: async ({ args }) => {
      const userConfig = api.config?.commitlint || {};
      const pluginConfig = api.mergeConfig(userConfig, args);

      commitLint(args._, pluginConfig).catch(err =>
        setTimeout(() => {
          if (err.type === pkg.name) {
            process.exit(1);
          }
          throw err;
        })
      );
    }
  });
}
