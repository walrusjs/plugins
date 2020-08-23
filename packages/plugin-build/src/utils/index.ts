import { join } from 'path';
import randomColor from './random-color';

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

export { default as transformLess } from './transform-less';
export { default as getTsConfig } from './get-ts-config';
export { default as getBabelConfig } from './get-babel-config';
