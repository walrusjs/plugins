import gulp from 'gulp';

interface Metadata {
  [key: string]: any;
}

function runTask(toRun) {
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

export default (taskName: string) => {
  console.log(taskName);
  if (!taskName) return;
  require('./gulpfile');

  runTask(taskName);
}
