import { Api } from '@walrus/types';
import { join } from 'path';
import fs from 'fs';
import { camelCase, isFunction, upperFirst } from 'lodash';
import { PluginEntryConfig } from './types';

const defaultConfig: PluginEntryConfig = {
  ignore: [
    '.umi',
    'common',
    'components',
    'hooks',
    'util',
    'utils',
    'interface',
    'loading',
    'theme',
    'style'
  ],
  format: 'bigCamelCase',
  defaultExport: true,
};

export default function (api: Api) {
  api.describe({
    key: 'entry',
    config: {
      default: defaultConfig,
      schema(joi) {
        return joi.object({
          ignore: joi.array().items(joi.string()),
          sacnParh: joi.string(),
          writePath: joi.string(),
          mode: joi.string(),
          defaultExport: joi.boolean(),
          format: joi.alternatives(joi.string(), joi.function())
        });
      }
    }
  });

  api.registerCommand({
    name: 'entry',
    description: 'generate entry file',
    fn: async () => {
      const { entry } = api.config as { entry: PluginEntryConfig };
      // 扫描路径
      const SCAN_PATH = join(api.cwd, 'src');
      // 生成路径
      const WRITE_PATH = join(api.cwd, 'src/index.ts');

      entry.sacnParh = entry.sacnParh || SCAN_PATH;
      entry.writePath = entry.writePath || WRITE_PATH;

      const { ignore, sacnParh, writePath, format, defaultExport } = entry || {};

      try {
        // 生成的文件名，首字母小写
        const files = fs.readdirSync(sacnParh);

        const useableFiles = [];
        files.forEach((item) => {
          const stat = fs.statSync(`${sacnParh}/${item}`);
          if (stat.isDirectory() && !ignore.includes(item)) {
            useableFiles.push(item);
          }
        });

        const formatExportName = (name: string): string => {
          if (format === 'original') {
            return name;
          }

          if (isFunction(format)) {
            return format(name) || name;
          }

          return format === 'bigCamelCase' ? upperFirst(camelCase(name)) : camelCase(name);
        }

        let fileString =
        '// 此文件在构建时会自动更新，请勿手动修改! \n';

        useableFiles.forEach((item) => {
          const name = formatExportName(item);

          if (defaultExport) {
            fileString += `import ${name} from './${item}';\n`;
          } else {
            fileString += `import { ${name} } from './${item}';\n`;
          }
        });
        fileString += `\nexport {\n  ${useableFiles.map(formatExportName).join(',\n  ')}\n};`;
        fileString += `\n\nexport default {\n  ${useableFiles.map(formatExportName).join(',\n  ')}\n};`;

        fs.writeFileSync(writePath, fileString);

        console.log('入口文件生成完成');
      } catch (err) {
        console.log(err);
      }
    }
  });
}
