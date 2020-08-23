import gulp from 'gulp';
import { compileLess, compile } from './tasks';
import { log } from './utils';

gulp.task('compile-with-es', done => {
  log('compile to es dir');
  compile(false).on('finish', done);
});

gulp.task('compile-with-lib', done => {
  log('compile to lib dir');
  // compile().on('finish', done);
  done();
});

gulp.task(
  'compile',
  gulp.series('compile-with-es', 'compile-with-lib')
);

gulp.task('compile:less', done => {
  log('compile less');
  compileLess().on('finish', done);
});

