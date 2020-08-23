import less from 'less';
import postcss from 'postcss';
import { resolve, dirname } from 'path';
import { readFileSync } from 'fs';
import NpmImportPlugin from 'less-plugin-npm-import';
import postcssConfig from './postcss-config';

interface Options {
  cwd?: string;
}

function transformLess(
  lessFile: string,
  options: Options = {}
) {
  const { cwd = process.cwd() } = options;
  const resolvedLessFile = resolve(cwd, lessFile);

  let data = readFileSync(resolvedLessFile, 'utf-8');
  data = data.replace(/^\uFEFF/, '');

  const lessOpts = {
    paths: [dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [new NpmImportPlugin({ prefix: '~' })],
    javascriptEnabled: true,
  };

  return less
    .render(data, lessOpts)
    .then(result => postcss(postcssConfig.plugins).process(result.css, { from: undefined }))
    .then(r => r.css);
}

export default transformLess;
