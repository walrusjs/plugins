import { join } from 'path';
import inquirer from 'inquirer';
import { chalk, execa } from '@walrus/utils';
import { LernaInfo } from '../types';

export function logStep(name) {
  console.log(`${chalk.gray('>> Release:')} ${chalk.magenta.bold(name)}`);
}

export function printErrorAndExit(message) {
  console.error(chalk.red(message));
  process.exit(1);
}

export function packageExists({ name, version }): boolean {
  const { stdout } = execa.sync('npm', ['info', `${name}@${version}`]);
  return stdout.length > 0;
}

export async function confirmVersion(version: string) {
  const { yes } = await inquirer.prompt([
    {
      name: 'yes',
      message: `Confirm releasing ${version}?`,
      type: 'confirm'
    }
  ]);

  return yes;
}

/**
 * 获取lerna.json
 * @param cwd
 */
export function resolveLerna(cwd: string): LernaInfo {
  try {
    return require(join(cwd, 'lerna.json'));
  } catch (e) {
    return {};
  }
}

export { default as exec } from './exec';
export { default as getLernaUpdated } from './get-lerna-updated';
export { default as syncTNpm } from './sync-tnpm';
export { default as getChangelog } from './get-changelog';
export { default as isNextVersion } from './is-next-version';
export { default as getNextVersion } from './get-next-version';
