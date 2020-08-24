import { Api } from '@walrus/types';
import gulp from 'gulp';
import { BuildPluginConfig } from './types';
import { runTask } from './utils';

const defaultConfig: BuildPluginConfig = {
  libraryDir: 'components',
};

export default function (api: Api) {
  process.env.PROJECT_NAME = api.pkg.name;

  api.describe({
    key: 'build',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          libraryDir: joi.string()
        });
      }
    }
  });

  api.registerCommand({
    name: 'build',
    alias: 'b',
    description: 'build your project',
    fn: async ({ args }) => {
      const commands = args._ || [];

      if (commands.length === 2 && commands[0] === 'run') {
        require('./gulpfile');
        runTask(commands[1]);

        gulp.on('task_not_found', (data) => {
          console.log(123);
        })
      }
    }
  });
}
