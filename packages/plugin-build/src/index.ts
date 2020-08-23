import { Api } from '@walrus/types';
import gulp from 'gulp';
import { BuildPluginConfig } from './types';

interface Metadata {
  [key: string]: any;
}

const defaultConfig: BuildPluginConfig = {
  libraryDir: 'components',
};

export function runTask(toRun) {
  const metadata: Metadata = { task: toRun };

  const taskInstance = gulp.task(toRun);
  if (taskInstance === undefined) {
    gulp.emit('task_not_found', metadata);
    return;
  }
  const start = process.hrtime();
  gulp.emit('task_start', metadata);
  try {
    taskInstance.apply(gulp);
    metadata.hrDuration = process.hrtime(start);
    gulp.emit('task_stop', metadata);
    gulp.emit('stop');
  } catch (err) {
    err.hrDuration = process.hrtime(start);
    err.task = metadata.task;
    gulp.emit('task_err', err);
  }
}

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
