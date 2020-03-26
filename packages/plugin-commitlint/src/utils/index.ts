import resolveFrom from 'resolve-from';
import resolveGlobal from 'resolve-global';
import { lodash } from '@birman/utils';
import { UserConfig, ParserPreset, Flags } from '../types';

/**
 *
 * @param input
 * @param flags
 */
export function checkFromStdin(input, flags: Flags) {
  return input.length === 0 && !checkFromRepository(flags);
}

/**
 *
 * @param flags
 */
export function checkFromRepository(flags: Flags) {
  return checkFromHistory(flags) || checkFromEdit(flags);
}

/**
 *
 * @param flags
 */
export function checkFromEdit(flags: Flags) {
  return Boolean(flags.edit) || flags.env;
}

/**
 *
 * @param flags
 */
function checkFromHistory(flags: Flags) {
  return typeof flags.from === 'string' || typeof flags.to === 'string';
}

/**
 *
 * @param flags
 */
export function normalizeFlags(flags: Flags) {
  const edit = getEditValue(flags);
  return lodash.merge({}, flags, { edit, e: edit });
}

/**
 * 获取 edit 的值
 * @param flags
 */
function getEditValue(flags: Flags) {
  if (flags.env) {
    if (!(flags.env in process.env)) {
      throw new Error(
        `Recieved '${flags.env}' as value for -E | --env, but environment variable '${flags.env}' is not available globally`
      );
    }
    return process.env[flags.env];
  }
  const { edit } = flags;

  // If the edit flag is set but empty (i.e '-e') we default
  // to .git/COMMIT_EDITMSG
  if (edit === '') {
    return true;
  }
  if (typeof edit === 'boolean') {
    return edit;
  }

  // The recommended method to specify -e with husky was `commitlint -e $HUSKY_GIT_PARAMS`
  // This does not work properly with win32 systems, where env variable declarations
  // use a different syntax
  // See https://github.com/conventional-changelog/commitlint/issues/103 for details
  // This has been superceded by the `-E GIT_PARAMS` / `-E HUSKY_GIT_PARAMS`
  const isGitParams = edit === '$GIT_PARAMS' || edit === '%GIT_PARAMS%';

  const isHuskyParams = edit === '$HUSKY_GIT_PARAMS' || edit === '%HUSKY_GIT_PARAMS%';

  if (isGitParams || isHuskyParams) {
    console.warn(`Using environment variable syntax (${edit}) in -e |\
--edit is deprecated. Use '{-E|--env} HUSKY_GIT_PARAMS instead'`);

    if (isGitParams && 'GIT_PARAMS' in process.env) {
      return process.env.GIT_PARAMS;
    }

    if ('HUSKY_GIT_PARAMS' in process.env) {
      return process.env.HUSKY_GIT_PARAMS;
    }

    throw new Error(
      `Received ${edit} as value for -e | --edit, but GIT_PARAMS or HUSKY_GIT_PARAMS are not available globally.`
    );
  }

  return edit;
}

/**
 *
 * @param seed
 */
export function getSeed(seed) {
  const e = Array.isArray(seed.extends) ? seed.extends : [seed.extends];
  const n = e.filter((i) => typeof i === 'string');

  return n.length > 0
    ? { extends: n, parserPreset: seed.parserPreset }
    : { parserPreset: seed.parserPreset };
}

/**
 *
 * @param parserPreset
 */
export function selectParserOpts(parserPreset: ParserPreset) {
  if (typeof parserPreset !== 'object') {
    return undefined;
  }

  if (typeof parserPreset.parserOpts !== 'object') {
    return undefined;
  }

  return parserPreset.parserOpts;
}

/**
 * 加载 Formatter 模块
 * @param config
 * @param flags
 */
export function loadFormatter(config: UserConfig, flags: Flags) {
  const moduleName = (flags.format || config.formatter || '@commitlint/format') as string;

  const modulePath =
    resolveFrom.silent(__dirname, moduleName) ||
    resolveFrom.silent(flags.cwd, moduleName) ||
    resolveGlobal.silent(moduleName);

  if (modulePath) {
    const moduleInstance = require(modulePath);

    if (lodash.isFunction(moduleInstance.default)) {
      return moduleInstance.default;
    }

    return moduleInstance;
  }

  throw new Error(`Using format ${moduleName}, but cannot find the module.`);
}
