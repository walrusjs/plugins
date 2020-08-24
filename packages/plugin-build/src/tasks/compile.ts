import gulp from 'gulp';
import merge2 from 'merge2';
import rimraf from 'rimraf';
import { getProjectPath, getTsConfig } from '../utils';
import { less } from './compile-less';
import { log } from '../utils';

const typescript = require('gulp-typescript');

const esDir = getProjectPath('es');
const libDir = getProjectPath('lib');
const tsDefaultReporter = typescript.reporter.defaultReporter();

export default function compile(modules) {
  const distDir = modules === false ? esDir : libDir;
  const tsConfig = getTsConfig();

  log(`Clean ${modules === false ? 'es' : 'lib'} directory`);

  // 删除编译目录
  rimraf.sync(distDir);

  // 编译样式
  const compileLess = less
    .pipe(gulp.dest(distDir));

  // 处理图片资源
  const assets = gulp
    .src(['components/**/*.@(png|svg)'])
    .pipe(gulp.dest(distDir));

  let error = 0;
  const source = [
    'components/**/*.tsx',
    'components/**/*.ts',
    'typings/**/*.d.ts',
    '!components/**/__tests__/**',
  ];

  // const tsResult = gulp.src(source)
  //   .pipe(
  //     typescript(tsConfig, {
  //       error(e) {
  //         tsDefaultReporter.error(e);
  //         error = 1;
  //       },
  //       finish: tsDefaultReporter.finish,
  //     })
  //   );

  // function check() {
  //   if (error) {
  //     process.exit(1);
  //   }
  // }

  // tsResult.on('finish', check);
  // tsResult.on('end', check);
  // const tsFilesStream = babelify(tsResult.js, modules);
  // const tsd = tsResult.dts.pipe(distDir);

  return merge2([compileLess, assets]);
}
