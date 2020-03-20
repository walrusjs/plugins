import commitLint from './commitlint';
import { Api } from '@walrus/types';

const pkg = require('../package.json');

export default function(api: Api) {
  api.describe({
    key: 'commitlint',
    config: {
      default: {},
      schema(joi) {
        return joi.object({

        });
      },
    }
  });

  api.registerCommand({
    name: 'commitlint',
    description: 'lint your commit messages',
    fn: async ({ args }) => {
      commitLint(args._, Object.assign({}, args) as any).catch(
        (err) =>
          setTimeout(() => {
            if (err.type === pkg.name) {
              process.exit(1);
            }
            throw err;
          })
        );
    }
  })
}
