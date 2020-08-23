import { existsSync } from 'fs';
import assign from 'object-assign';
import { getProjectPath } from './';

export default function () {
  let userConfig: any = {};
  if (existsSync(getProjectPath('tsconfig.json'))) {
    userConfig = require(getProjectPath('tsconfig.json'));
  }
  return assign(
    {
      noUnusedParameters: true,
      noUnusedLocals: true,
      strictNullChecks: true,
      target: 'es6',
      jsx: 'preserve',
      moduleResolution: 'node',
      declaration: true,
      allowSyntheticDefaultImports: true,
    },
    userConfig.compilerOptions
  );
}
