import { Api } from '@walrus/types';

export default function(api: Api) {
  api.describe({
    key: 'eslint',
    config: {
      default: {},
      schema(joi) {
        return joi.object({

        });
      },
    }
  });

  api.registerCommand({
    name: 'eslint',
    alias: 'r',
    description: 'publish your project',
    fn: async ({ args }) => {
      console.log('eslint');

    }
  })
}
