import { logStep } from './';
import { execa } from '@birman/utils';

const lernaCli = require.resolve('lerna/cli');

const getLernaUpdated = (publishOnly: boolean) => {
  let updated = null;

  if (!publishOnly) {
    // Get updated packages
    logStep('check updated packages');

    const updatedStdout = execa.sync(lernaCli, ['changed']).stdout;

    updated = updatedStdout
      .split('\n')
      .map(pkg => {
        return pkg.split('/')[1];
      })
      .filter(Boolean);
  }

  return updated;
}

export default getLernaUpdated;
