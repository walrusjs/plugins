import { extname } from 'path';
import { getSupportInfo } from 'prettier';

const extensions = getSupportInfo().languages.reduce(
  (prev, language) => prev.concat(language.extensions || []),
  []
);

export function isSupportedExtension(file: string) {
  return extensions.includes(extname(file));
}

export { default as processFiles } from './process-files';
