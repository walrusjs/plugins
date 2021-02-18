import { Api } from '@walrus/types';

const execa = require('execa');

export default function (api: Api) {
  api.registerCommand({
    name: 'run',
    description: 'Run a js/ts script',
    fn: async ({ args }) => {
      try {
        execa.sync(
          'node',
          [
            '--unhandled-rejections=strict',
            '-r',
            require.resolve('./swc-register'),
            args._[0],
          ],
          {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit',
          },
        )
      } catch {}
    }
  });
}
