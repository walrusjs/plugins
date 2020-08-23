import gulp from 'gulp';
import concat from 'gulp-concat';
import through2 from 'through2';
import { transformLess, getProjectPath } from '../utils';

const distDir = getProjectPath('dist');

export const less = gulp
  .src(['components/**/*.less'])
  .pipe(
    through2.obj(function (file, encoding, next) {
      this.push(file.clone());
      if (
        file.path.match(/(\/|\\)style(\/|\\)index\.less$/) ||
        file.path.match(/(\/|\\)style(\/|\\)v2-compatible-reset\.less$/)
      ) {
        transformLess(file.path)
          .then(css => {
            file.contents = Buffer.from(css);
            file.path = file.path.replace(/\.less$/, '.css');
            this.push(file);
            next();
          })
          .catch(e => {
            console.error(e);
          });
      } else {
        next();
      }
    })
  )

/**
 * 编译样式到Dist目录
 */
function compileLess() {
  return less
    .pipe(concat('index.css'))
    .pipe(gulp.dest(distDir));;
}


export default compileLess;
