import { join } from 'path';
import { readdirSync } from 'fs';

export default function getPackages(cwd) {
  return readdirSync(join(cwd, 'packages')).filter(
    pkg => pkg.charAt(0) !== '.',
  );
};
