import { Api } from '@walrus/types';

export default function (api: Api) {
  const { chalk } = api.utils;

  api.registerCommand({
    name: 'test',
    alias: 't',
    description: 'test your project',
    fn: async ({ args }) => {
      require('@walrus/test')
        .default(args)
        .catch((e) => {
          console.error(chalk.red(e));
          process.exit(1);
        })
    }
  });
}
