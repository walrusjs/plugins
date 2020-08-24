import { join } from 'path';
import gulp from 'gulp';
import randomColor from './random-color';

interface Metadata {
  [key: string]: any;
}

const cwd = process.cwd();

export function getProjectPath(...filePath) {
  return join(cwd, ...filePath);
}

export function log(msg) {
  const name = process.env.PROJECT_NAME;
  console.log(`${name ? `${randomColor(name)}: ` : ''}${msg}`);
}

export function resolve(moduleName) {
  return require.resolve(moduleName);
}

/**
 * 运行gulp人物
 * @param taskName
 */
export function runTask(taskName: string) {
  const metadata: Metadata = { task: taskName };

  const taskInstance = gulp.task(taskName);
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

export { default as transformLess } from './transform-less';
export { default as getTsConfig } from './get-ts-config';
export { default as getBabelConfig } from './get-babel-config';
