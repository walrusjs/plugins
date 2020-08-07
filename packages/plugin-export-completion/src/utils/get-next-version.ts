import { semver } from '@walrus/utils';
import inquirer from 'inquirer';

export const bumps = ['patch', 'minor', 'major', 'prerelease'];

export default async function getNextVersion(currentVersion: string) {
  const versions = {};
  bumps.forEach((b) => {
    versions[b] = semver.inc(currentVersion, b as any);
  });

  const bumpChoices = bumps.map((b) => ({ name: `${b} (${versions[b]})`, value: b }));

  const { bump, customVersion } = await inquirer.prompt([
    {
      name: 'bump',
      message: 'Select release type:',
      type: 'list',
      choices: [...bumpChoices, { name: 'custom', value: 'custom' }]
    },
    {
      name: 'customVersion',
      message: 'Input version:',
      type: 'input',
      when: (answers) => answers.bump === 'custom'
    }
  ]);

  return customVersion || versions[bump];
}
