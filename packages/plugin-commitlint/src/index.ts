import { Api } from '@walrus/types';

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
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      console.log('commitlint');

    }
  })
}
